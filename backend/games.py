from flask import Blueprint, jsonify
import os
import json
from datetime import datetime
from heatseeker.heatseeker import heatseeker
from frontend import games_dir
from sumitup.sumitup import sumitup

games = Blueprint('games', __name__)
games.register_blueprint(heatseeker, url_prefix="/heatseeker")
games.register_blueprint(sumitup, url_prefix="/sumitup")

games_json_path = os.path.join(games_dir, "games.json")

def get_latest_modified_time(path) -> float:
    latest = os.path.getmtime(path)
    for root, _, files in os.walk(path):
        for fname in files:
            fpath = os.path.join(root, fname)
            try:
                mtime = os.path.getmtime(fpath)
                if mtime > latest:
                    latest = mtime
            except FileNotFoundError:
                continue
    return latest


@games.route('/', methods=["GET"])
def get_games():
    if not os.path.exists(games_json_path):
        return jsonify({"error": "games.json not found"}), 404

    try:
        with open(games_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 500

    # NOTE: when scaled, this could become very expensive
    for key, value in data.items():
        folder_path = os.path.join(games_dir, key)
        if os.path.isdir(folder_path):
            timestamp = get_latest_modified_time(folder_path)
            modified_date = datetime.fromtimestamp(timestamp).strftime("%m/%d/%Y")
            value["date"] = modified_date
        else:
            value["date"] = "Unknown"

    return jsonify(data)
