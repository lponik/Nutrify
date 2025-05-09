import requests
import json
from config import Config

def get_nutrient_index(food_item):
    """
    Get nutritional information for a food item using the Gemini API
    
    Args:
        food_item (str): The food item to look up
        
    Returns:
        dict: Nutritional information or error message
    """
    # Google's Gemini API expects a different request format
    prompt = f"Give me the full macro and micronutrient index of '{food_item}' in a structured format. Include calories, protein, carbohydrates, fat, vitamins, and minerals with their amounts and daily value percentages where applicable."
    
    # Proper request format for Gemini API
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 800
        }
    }
    
    # Set headers with API key
    headers = {
        "Content-Type": "application/json"
    }
    
    # Use the correct URL format with API key as query parameter
    url = f"{Config.GEMINI_API_URL}?key={Config.GEMINI_API_KEY}"
    
    try:
        # Make request to Gemini API
        response = requests.post(url, headers=headers, json=payload)
        
        # For debugging - log the status code
        print(f"Gemini API Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            # Extract the generated text from Gemini's response structure
            try:
                content = result.get("candidates", [])[0].get("content", {})
                text = content.get("parts", [])[0].get("text", "")
                return {"result": text}
            except (IndexError, KeyError) as e:
                return {"error": f"Failed to parse API response: {str(e)}"}
        else:
            # Return more detailed error information
            try:
                error_detail = response.json()
            except:
                error_detail = response.text
            return {"error": f"Gemini API error: {response.status_code}", "details": error_detail}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}
