import os
from dotenv import load_dotenv
import subprocess
import paramiko
from scp import SCPClient
import getpass

load_dotenv()

# === CONFIG ===
REMOTE_USER = os.getenv("REMOTE_USER")
REMOTE_HOST = os.getenv("REMOTE_HOST")
REMOTE_BASE_DIR = os.getenv("REMOTE_BASE_DIR")
SERVICE_NAME = os.getenv("SERVICE_NAME")

LOCAL_BACKEND_DIR = "backend"
LOCAL_FRONTEND_DIST_DIR = "frontend/dist"
LOCAL_GAMES_DIST_DIR = "games"

# === STEP 0: Prompts ===
password = getpass.getpass("Enter SSH password: ")
build_frontend = input("Do you want to rebuild the frontend? (yes/no): ")
install_python_packages = input("Do you want reinstall python packages? (yes/no): ")
send_games = input("Do you want to send games? (yes/no): ")
send_games = send_games.lower() in ["yes", "y"]

# === Step 1: Run npm build ===
if build_frontend.lower() in ["yes", "y"]:
    print("Running npm run build...")
    subprocess.run(["npm.cmd", "run", "build"], cwd="frontend", check=True)

# === Step 2: Setup SSH connection ===
print("Connecting to remote host...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(REMOTE_HOST, username=REMOTE_USER, password=password)

# === Step 3: Create necessary directories on remote ===
print("Creating remote directories...")
commands = [
    f"mkdir -p {REMOTE_BASE_DIR}/backend",
    f"mkdir -p {REMOTE_BASE_DIR}/frontend",
    f"mkdir -p {REMOTE_BASE_DIR}/games" if send_games else ""
]
for cmd in commands:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status()  # Wait for command to finish

# === Step 4: SCP files ===
print("Transferring backend, frontend/dist", end="")
if send_games:
    print(", games", end="")
print("...")
with SCPClient(ssh.get_transport()) as scp:
    scp.put(LOCAL_BACKEND_DIR, recursive=True, remote_path=REMOTE_BASE_DIR)
    scp.put(LOCAL_FRONTEND_DIST_DIR, recursive=True, remote_path=f"{REMOTE_BASE_DIR}/frontend")

    if send_games:
        scp.put(LOCAL_GAMES_DIST_DIR, recursive=True, remote_path=REMOTE_BASE_DIR) 

# === Step 5: Install Python Packages ===
if install_python_packages.lower() in ["yes", "y"]:
    print("Installing python packages...")
    # Install python packages into /venv/ from /backend/requirements.txt and install gunicorn
    remote_commands = [
        f"cd {REMOTE_BASE_DIR}/backend",
        "python3 -m venv venv",
        "source venv/bin/activate && pip install -r requirements.txt && pip install gunicorn"
    ]
    # Chain commands using '&&' so each only runs if the previous one succeeds
    install_cmd = " && ".join(remote_commands)
    stdin, stdout, stderr = ssh.exec_command(install_cmd)
    exit_status = stdout.channel.recv_exit_status()

    if exit_status == 0:
        print("✅ Python packages installed successfully.")
    else:
        print("❌ Error installing Python packages.")
        print(stderr.read().decode())

# === Step 6: Restart Service ===
print("Restarting Service")
# Using sudo to restart the service
restart_command = "echo '{}' | sudo -S systemctl restart {}".format(password, SERVICE_NAME)
stdin, stdout, stderr = ssh.exec_command(restart_command)
stdin.write(password + "\n")  # send sudo password
stdin.flush()

exit_status = stdout.channel.recv_exit_status()
if exit_status == 0:
    print("✅ Service restarted successfully.")
else:
    print("❌ Error restarting service.")
    print(stderr.read().decode())


print("✅ Deployment complete.")
