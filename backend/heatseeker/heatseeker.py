import hashlib
import hmac

from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
import json
import os
from db import DB_DIR
from logging_config import get_app_logger

logger = get_app_logger()

heatseeker = Blueprint('heatseeker', __name__)

LEADERBOARD_FILE = os.path.join(DB_DIR, "heatseeker", "leaderboard.json")
MAX_ENTRIES = 20

load_dotenv()
HEATSEEKER_SECRET_KEY = bytes.fromhex(os.getenv('HEATSEEKER_SECRET'))

def verify_signature(username: str, score: int, signature: str) -> bool:
    msg = str(username + str(score)).encode()
    expected_sig = hmac.new(HEATSEEKER_SECRET_KEY, msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

def load_leaderboard():
    if not os.path.exists(os.path.join(DB_DIR, "heatseeker")):
        os.mkdir(os.path.join(DB_DIR, "heatseeker"))

    if not os.path.exists(LEADERBOARD_FILE) or os.path.getsize(LEADERBOARD_FILE) == 0:
        with open(LEADERBOARD_FILE, "w") as f:
            json.dump([], f)
        return []

    try:
        with open(LEADERBOARD_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        # If file is corrupt (not valid JSON), reset it
        with open(LEADERBOARD_FILE, "w") as f:
            json.dump([], f)
        return []

def save_leaderboard(scores):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(scores, f, indent=2)

@heatseeker.route("/")
def home():
    return "Heatseeker API", 200

@heatseeker.route("/submit", methods=["POST"])
def submit_score():
    data = request.get_json()
    username = data.get("username")
    score = data.get("score")
    signature = data.get("signature")

    if signature is None:
        logger.warn(f"{request.remote_addr} - score submitted without signature - {username}: {score}",
                    extra={"tag": "Heatseeker"})

    if not verify_signature(username, score, signature):
        logger.warn(f"{request.remote_addr} - score submitted with incorrect signature - {username}: {score}",
                    extra={"tag": "Heatseeker"})

    if not username or not isinstance(score, int):
        return jsonify({ "error": "Invalid data" }), 400

    scores = load_leaderboard()

    username = username.replace("\u200b", "")
    # Add and sort
    scores.append({ "username": username, "score": score })
    scores = sorted(scores, key=lambda x: x["score"], reverse=True)

    # Trim to max entries
    scores = scores[:MAX_ENTRIES]

    save_leaderboard(scores)
    logger.info(f"{request.remote_addr} - new score - {username}: {score}", extra={"tag": "Heatseeker"})
    return jsonify({ "status": "success" }), 200

@heatseeker.route("/top10", methods=["GET"])
def top10():
    scores = load_leaderboard()[:10]
    return jsonify(scores)
