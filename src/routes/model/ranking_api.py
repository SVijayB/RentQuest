from flask import Flask, jsonify, request, Blueprint
from src.routes.model import ranking

ranking_bp = Blueprint("ranking", __name__, url_prefix="/ranking")


@ranking_bp.route("/", methods=["GET"])
def ranking():
    return jsonify({"message": "Ranking API"})


@ranking_bp.route("/", methods=["POST"])
def ranking_post():
    data = request.json
    final_ranking = ranking.rank_appartments(data)
    return jsonify(final_ranking)
