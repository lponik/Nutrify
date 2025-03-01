from flask import jsonify
from backend.database.db_manager import get_user_nutrient_goals, update_user_nutrient_progress

class NutrientService:
    def __init__(self, user_id):
        self.user_id = user_id

    def get_nutrient_goals(self):
        goals = get_user_nutrient_goals(self.user_id)
        return jsonify(goals)

    def update_nutrient_progress(self, nutrient_data):
        success = update_user_nutrient_progress(self.user_id, nutrient_data)
        if success:
            return jsonify({"message": "Nutrient progress updated successfully."}), 200
        else:
            return jsonify({"message": "Failed to update nutrient progress."}), 400