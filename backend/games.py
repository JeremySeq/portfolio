from flask import Blueprint, jsonify
import os
import json
from datetime import datetime
from heatseeker.heatseeker import heatseeker
from frontend import games_dir

games = Blueprint('games', __name__)
games.register_blueprint(heatseeker, url_prefix="/heatseeker")

games_json_path = os.path.join(games_dir, "games.json")

@games.route('/', methods=["GET"])
def get_games():
    if not os.path.exists(games_json_path):
        return jsonify({"error": "games.json not found"}), 404

    try:
        with open(games_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 500

    for key, value in data.items():
        folder_path = os.path.join(games_dir, key)
        if os.path.isdir(folder_path):
            timestamp = os.path.getmtime(folder_path)
            modified_date = datetime.fromtimestamp(timestamp).strftime("%m/%d/%Y")
            value["date"] = modified_date
        else:
            value["date"] = "Unknown"

    return jsonify(data)
