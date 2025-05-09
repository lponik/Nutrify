class Config:
    SECRET_KEY = '__CHANGE_ME__'  # Update with a strong secret key
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'  # Update with your database URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = '__CHANGE_LATER__'  # Update with your Gemini API key
    GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta'  # Update with the correct API URL
    NUTRIENT_GOAL_DEFAULTS = {
        'calories': 2000,
        'protein': 50,
        'carbs': 300,
        'fats': 70
    }