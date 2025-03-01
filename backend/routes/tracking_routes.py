from flask import Blueprint, request, jsonify
from ..services.nutrient_service import NutrientService

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/track', methods=['POST'])
def track_nutrients():
    data = request.json
    user_id = data.get('user_id')
    food_items = data.get('food_items')

    if not user_id or not food_items:
        return jsonify({'error': 'User ID and food items are required'}), 400

    nutrient_service = NutrientService()
    result = nutrient_service.track_nutrients(user_id, food_items)

    return jsonify(result), 200

@tracking_bp.route('/goals', methods=['GET'])
def get_nutrient_goals():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    nutrient_service = NutrientService()
    goals = nutrient_service.get_nutrient_goals(user_id)

    return jsonify(goals), 200

@tracking_bp.route('/progress', methods=['GET'])
def get_progress():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    nutrient_service = NutrientService()
    progress = nutrient_service.get_progress(user_id)

    return jsonify(progress), 200