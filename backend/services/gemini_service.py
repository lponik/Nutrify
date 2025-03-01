import os
import base64
import google.generativeai as genai
from PIL import Image
from io import BytesIO

class GeminiService:
    def __init__(self, api_key=None):
        """Initialize the Gemini Service with API key"""
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required")
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
    
    def test_api_key(self):
        """Test if the API key is valid by making a simple request"""
        try:
            # List available models as a simple test
            models = genai.list_models()
            model_names = [model.name for model in models]
            print(f"Available models: {model_names}")
            return True
        except Exception as e:
            print(f"API key test failed: {str(e)}")
            return False
            
    def analyze_food_text(self, food_description):
        """
        Analyze a text description of food and return nutritional information
        
        Args:
            food_description: Text description of food
        
        Returns:
            dict: Nutritional information extracted from the description
        """
        try:
            # Create a prompt that asks for nutritional analysis
            prompt = f"""
            Based on this food description: "{food_description}"
            
            Provide detailed nutritional information in JSON format.
            Include:
            - Food name
            - Portion size (standard)
            - Calories
            - Macronutrients (protein, carbs, fat)
            - Key vitamins and minerals
            - Any potential allergens
            
            Format the response as valid JSON only with no other text.
            """
            
            # Use text-only model for this request
            text_model = genai.GenerativeModel('models/gemini-1.5-pro')
            
            # Generate response from Gemini
            response = text_model.generate_content(prompt)
            
            # Extract the response text
            response_text = response.text
            
            return {
                "success": True,
                "data": response_text
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        
    def analyze_food_image(self, image_file):
        """Analyze an image of food and return nutritional information"""
        try:
            # Open the image file
            img = Image.open(image_file)
            
            # Create prompt for nutritional analysis
            prompt = """
            Analyze this food image and provide detailed nutritional information in JSON format.
            Include:
            - Food name
            - Portion size (estimated)
            - Calories
            - Macronutrients (protein, carbs, fat)
            - Key vitamins and minerals
            - Any potential allergens
            
            Format the response as valid JSON only with no other text.
            """
            
            # Use vision-capable model
            vision_model = genai.GenerativeModel('models/gemini-1.5-pro')
            
            # Generate response
            response = vision_model.generate_content([prompt, img])
            
            # Extract response text
            response_text = response.text
            
            return {
                "success": True,
                "data": response_text
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }