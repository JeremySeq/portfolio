"""
Contains API routes for games. (Ex: leaderboard stats, etc)
"""
from flask import Blueprint
from heatseeker.heatseeker import heatseeker


games = Blueprint('games', __name__)

# heatseeker
games.register_blueprint(heatseeker, url_prefix="/heatseeker/")
