from flask import Blueprint, request, jsonify
from logging_config import get_app_logger
import curseforge_data
from games import games

logger = get_app_logger()

api = Blueprint('api', __name__)

# game API routes
api.register_blueprint(games, url_prefix="/games/")

@api.route("/")
def hello_world():
    return "Hello World", 200

@api.route("/message", methods=["POST"])
def message():
    m = request.form.get("message")
    ip = request.remote_addr
    logger.info(f"{ip} - {m}")
    return "", 200

@api.route('/mod_data', methods=["GET"])
def get_mod_data():
    ip = request.remote_addr
    logger.info(f"{ip} - requested mod data")

    mods = curseforge_data.fetch_mods_by_author()
    if mods:
        total, all_projects = curseforge_data.get_download_summary(mods)
        return jsonify({
            "total": total,
            "projects": all_projects
        }), 200
    return jsonify({}), 500

@api.route('/clicked_social/<social>', methods=["POST"])
def clicked_social(social: str):
    ip = request.remote_addr
    logger.info(f"{ip} - CLICKED SOCIAL: {social}")
    return "", 200
