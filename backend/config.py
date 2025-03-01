class Config:
    SECRET_KEY = '5791628bb0b13ce0c676dfde280ba245'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'  # Update with your database URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = 'AIzaSyA6OSUVUVZ3XWXvBQgFfYWHVquAoUvcFnw'  # Update with your Gemini API key
    GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta'  # Update with the correct API URL
    NUTRIENT_GOAL_DEFAULTS = {
        'calories': 2000,
        'protein': 50,
        'carbs': 300,
        'fats': 70
    }