def calculate_nutrient_percentage(nutrient_value, goal_value):
    if goal_value <= 0:
        return 0
    return (nutrient_value / goal_value) * 100

def format_nutrient_value(value):
    return "{:.2f}".format(value)

def validate_nutrient_input(nutrient_data):
    required_keys = ['calories', 'protein', 'carbs', 'fats']
    for key in required_keys:
        if key not in nutrient_data:
            raise ValueError(f"Missing required nutrient data: {key}")
    return True

def log_error(error_message):
    import logging
    logging.error(error_message)