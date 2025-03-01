# Nutrient Tracker

## Overview
Nutrient Tracker is a web application built with Flask and Python that helps users track their nutrient intake and achieve their dietary goals. The application utilizes the Gemini API to analyze pictures of food, providing users with detailed nutrient information.

## Project Structure
```
nutrient-tracker
├── backend                # Backend application
│   ├── app.py            # Entry point of the backend application
│   ├── config.py         # Configuration settings
│   ├── database           # Database module
│   │   ├── __init__.py
│   │   ├── models.py     # Database models
│   │   └── db_manager.py  # Database management functions
│   ├── services           # Services module
│   │   ├── __init__.py
│   │   ├── gemini_service.py  # Interactions with Gemini API
│   │   └── nutrient_service.py # Nutrient management functions
│   ├── routes             # Routes module
│   │   ├── __init__.py
│   │   ├── auth_routes.py  # User authentication routes
│   │   ├── food_routes.py  # Food management routes
│   │   └── tracking_routes.py # Nutrient tracking routes
│   └── utils              # Utilities module
│       ├── __init__.py
│       └── helpers.py     # Helper functions
├── frontend               # Frontend application
│   ├── static             # Static files (CSS, JS, images)
│   │   ├── css
│   │   │   └── main.css
│   │   ├── js
│   │   │   ├── dashboard.js
│   │   │   ├── food_capture.js
│   │   │   └── tracking.js
│   │   └── favicon.ico
│   └── templates          # HTML templates
│       ├── base.html
│       ├── dashboard.html
│       ├── food_capture.html
│       ├── index.html
│       ├── login.html
│       └── register.html
├── migrations             # Database migrations
│   └── versions
├── tests                  # Test suite
│   ├── __init__.py
│   ├── test_api.py       # API endpoint tests
│   └── test_models.py    # Database model tests
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── config.py             # Additional configuration settings
├── requirements.txt       # Project dependencies
└── README.md              # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nutrient-tracker.git
   cd nutrient-tracker
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your environment variables by copying `.env.example` to `.env` and updating the values as needed.

5. Run the backend application:
   ```
   python backend/app.py
   ```

6. Access the frontend by navigating to `http://localhost:5000` in your web browser.

## Usage
- Users can register and log in to track their nutrient intake.
- Users can upload images of food, which will be analyzed using the Gemini API.
- The application provides insights and progress tracking towards nutrient goals.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.