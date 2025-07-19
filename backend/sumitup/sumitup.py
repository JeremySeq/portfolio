import datetime
import json
import os

from flask import jsonify, Blueprint, request

from db import DB_DIR
from logging_config import get_app_logger
from sumitup.puzzle_utils import load_puzzle_from_file, generate_daily_puzzle, save_puzzle_to_file

logger = get_app_logger()

sumitup = Blueprint('sumitup', __name__)

if not os.path.exists(os.path.join(DB_DIR, "sumitup")):
    os.mkdir(os.path.join(DB_DIR, "sumitup"))

PUZZLE_FILE = os.path.join(DB_DIR, "sumitup", "daily_puzzle.json")
LEADERBOARD_FILE = os.path.join(DB_DIR, "sumitup", "leaderboard.json")

def get_today_date():
    today = datetime.date.today()
    return f"{today.month}-{today.day}-{today.year}"

@sumitup.route("/")
def get_puzzle():
    today = get_today_date()
    puzzle = load_puzzle_from_file(PUZZLE_FILE)

    if not puzzle or puzzle.get("date") != today:
        puzzle = generate_daily_puzzle(today)
        save_puzzle_to_file(puzzle, PUZZLE_FILE)

    return jsonify(puzzle)

@sumitup.route("/solved", methods=["POST"])
def receive_solve():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    time = data.get("time")
    name = data.get("name", "")  # optional name, default to empty string

    if time is None:
        return jsonify({"error": "Missing 'time' field"}), 400

    if os.path.exists(LEADERBOARD_FILE):
        try:
            with open(LEADERBOARD_FILE, "r", encoding="utf-8") as f:
                leaderboard = json.load(f)
        except json.JSONDecodeError:
            leaderboard = []
    else:
        leaderboard = []

    leaderboard.append({
        "date": get_today_date(),
        "time": time,
        "name": name.strip() or "Anonymous"
    })

    leaderboard = sorted(leaderboard, key=lambda x: x["time"])

    logger.info(f"{request.remote_addr} - new score - {name.strip() or 'Anonymous'}: {time}", extra={"tag": "SumItUp"})

    try:
        with open(LEADERBOARD_FILE, "w", encoding="utf-8") as f:
            json.dump(leaderboard, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save leaderboard: {e}")
        return jsonify({"error": "Failed to save leaderboard"}), 500

    return jsonify({"message": "Solve recorded"}), 200

@sumitup.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    today = datetime.date.today()
    today_str = f"{today.month}-{today.day}-{today.year}"

    if not os.path.exists(LEADERBOARD_FILE):
        return jsonify({"leaderboard": [], "average_time": None})

    try:
        with open(LEADERBOARD_FILE, "r", encoding="utf-8") as f:
            all_entries = json.load(f)
    except json.JSONDecodeError:
        return jsonify({"leaderboard": [], "average_time": None})

    # filter entries by today's date
    today_entries = [e for e in all_entries if e.get("date") == today_str]

    # average time if any entries present
    avg_time = None
    if today_entries:
        total_time = sum(e.get("time", 0) for e in today_entries)
        avg_time = total_time / len(today_entries)

    return jsonify({
        "leaderboard": today_entries,
        "average_time": avg_time
    })