class Config:
    SECRET_KEY = 'your_secret_key_here'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'  # Update with your database URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = 'your_gemini_api_key_here'  # Update with your Gemini API key
    GEMINI_API_URL = 'https://api.gemini.com/v1/'  # Update with the correct Gemini API URL