from flask import Blueprint, request, jsonify, current_app, render_template
from backend.services.gemini_service import GeminiService
import os

food_routes = Blueprint('food_routes', __name__)

# Simplified routes without database dependencies
@food_routes.route('/api/food/analyze-text', methods=['POST'])
def analyze_text():
    """Endpoint to analyze food based on text description"""
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({"error": "No text description provided"}), 400
    
    food_description = data['text']
    
    # Get API key from config
    api_key = current_app.config.get('GEMINI_API_KEY')
    
    # Initialize Gemini service
    try:
        gemini_service = GeminiService(api_key)
        result = gemini_service.analyze_food_text(food_description)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify({"error": result["error"]}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@food_routes.route('/api/food/analyze-image', methods=['POST'])
def analyze_image():
    """Endpoint to analyze food from an uploaded image"""
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    # Make sure it's an image file
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        return jsonify({"error": "File must be an image"}), 400
        
    # Get API key from environment
    api_key = os.environ.get('GEMINI_API_KEY')
    
    # Initialize Gemini service
    try:
        gemini_service = GeminiService(api_key)
        result = gemini_service.analyze_food_image(file)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify({"error": result["error"]}), 500
    
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return jsonify({"error": str(e)}), 500
    


@food_routes.route('/capture', methods=['GET'])
def capture():
    """Render the food capture page with camera functionality"""
    return render_template('food_capture.html')