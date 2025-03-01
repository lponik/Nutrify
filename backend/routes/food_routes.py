from flask import Blueprint, request, jsonify
from ..services.nutrient_service import NutrientService

food_routes = Blueprint('food_routes', __name__)
nutrient_service = NutrientService()

@food_routes.route('/api/food', methods=['POST'])
def add_food_item():
    data = request.json
    food_item = nutrient_service.add_food_item(data)
    return jsonify(food_item), 201

@food_routes.route('/api/food/<int:food_id>', methods=['GET'])
def get_food_item(food_id):
    food_item = nutrient_service.get_food_item(food_id)
    if food_item:
        return jsonify(food_item), 200
    return jsonify({'message': 'Food item not found'}), 404

@food_routes.route('/api/food/<int:food_id>', methods=['PUT'])
def update_food_item(food_id):
    data = request.json
    updated_item = nutrient_service.update_food_item(food_id, data)
    if updated_item:
        return jsonify(updated_item), 200
    return jsonify({'message': 'Food item not found'}), 404

@food_routes.route('/api/food/<int:food_id>', methods=['DELETE'])
def delete_food_item(food_id):
    success = nutrient_service.delete_food_item(food_id)
    if success:
        return jsonify({'message': 'Food item deleted'}), 204
    return jsonify({'message': 'Food item not found'}), 404