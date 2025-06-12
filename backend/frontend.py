import os
from flask import Blueprint, send_from_directory, request, redirect
from logging_config import get_app_logger

logger = get_app_logger()

frontend = Blueprint('frontend', __name__)

frontend_dist_dir = os.path.join(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')

games_dir = os.path.join(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))), 'games')

# Serve static files
@frontend.route('/assets/<path:path>')
def serve_assets(path):
    """Serves static assets from /frontend/dist/assets"""
    return send_from_directory(os.path.join(frontend_dist_dir, 'assets'), path)

@frontend.route('/favicon.ico')
def favicon():
    # return "", 404
    return send_from_directory(
        os.path.join(frontend_dist_dir, 'assets'), 'favicon.ico')


# --- Serve Unity Game Files ---
@frontend.route('/games/<game>')
def serve_game(game):
    return redirect(f"/games/{game}/index.html")

@frontend.route('/games/<game>/index.html')
def serve_game_index(game):
    """Serves a Unity game's index.html page"""
    logger.info(f"{request.remote_addr} - requested game: {game}", extra={"tag": "Frontend"})
    if not os.path.exists(os.path.join(games_dir, game)):
        return "Game Not Found", 404
    return send_from_directory(os.path.join(games_dir, game), 'index.html')

@frontend.route('/games/<game>/<path:path>')
def serve_game_static(game, path):

    full_path = os.path.join(games_dir, game, path)
    if not os.path.isfile(full_path):
        return "Not Found", 404
    return send_from_directory(os.path.join(games_dir, game), path)


@frontend.route('/', defaults={'path': ''})
@frontend.route('/<path:path>')
def serve(path):
    """Serves index.html main application file"""
    logger.info(f"{request.remote_addr} - requested /{path}", extra={"tag": "Frontend"})
    return send_from_directory(frontend_dist_dir, 'index.html')
