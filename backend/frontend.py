import os
import json
from flask import Blueprint, send_from_directory, request, redirect
from logging_config import get_app_logger

logger = get_app_logger()
frontend = Blueprint('frontend', __name__)

frontend_dist_dir = os.path.join(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')

games_dir = os.path.join(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))), 'games')

games_json_path = os.path.join(games_dir, "games.json")

with open(games_json_path, 'r', encoding='utf-8') as f:
    games_data = json.load(f)

def is_unity_game(game_name):
    game_info = games_data.get(game_name)
    return game_info is not None and game_info.get('isUnity', False) is True

# Serve static assets for the main frontend
@frontend.route('/assets/<path:path>')
def serve_assets(path):
    return send_from_directory(os.path.join(frontend_dist_dir, 'assets'), path)

@frontend.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(frontend_dist_dir, 'assets'), 'favicon.ico')

# --- Unity game serving routes ---

@frontend.route('/games/<game>')
def serve_game(game):
    if is_unity_game(game):
        return redirect(f"/games/{game}/index.html")
    # not unity - let main SPA handle routing
    logger.info(f"{request.remote_addr} - requested game: {game}", extra={"tag": "Frontend"})
    return send_from_directory(frontend_dist_dir, 'index.html')

@frontend.route('/games/<game>/')
def serve_game_2(game):
    if is_unity_game(game):
        return redirect(f"/games/{game}/index.html")
    return send_from_directory(frontend_dist_dir, 'index.html')

@frontend.route('/games/<game>/index.html')
def serve_game_index(game):
    logger.info(f"{request.remote_addr} - requested game: {game}", extra={"tag": "Frontend"})
    if is_unity_game(game):
        game_path = os.path.join(games_dir, game)
        if not os.path.exists(game_path):
            return "Game Not Found", 404
        return send_from_directory(game_path, 'index.html')
    return send_from_directory(frontend_dist_dir, 'index.html')

@frontend.route('/games/<game>/<path:path>')
def serve_game_static(game, path):
    if is_unity_game(game):
        full_path = os.path.join(games_dir, game, path)
        if not os.path.isfile(full_path):
            return "Not Found", 404
        return send_from_directory(os.path.join(games_dir, game), path)
    return send_from_directory(frontend_dist_dir, 'index.html')

# Main app SPA route catch-all
@frontend.route('/', defaults={'path': ''})
@frontend.route('/<path:path>')
def serve(path):
    logger.info(f"{request.remote_addr} - requested /{path}", extra={"tag": "Frontend"})
    return send_from_directory(frontend_dist_dir, 'index.html')
