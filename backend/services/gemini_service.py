import os
import base64
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import json
import re

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
        """Analyze a text description of food and return nutritional information"""
        try:
            # Create a prompt that asks for nutritional analysis with health assessment
            prompt = f"""
            Based on this food description: "{food_description}"
            
            Provide detailed nutritional information in JSON format.
            Include:
            - Food name (string)
            - Portion size (string)
            - Calories (number)
            - Macronutrients: protein (string with g unit), carbs (string with g unit), fat (string with g unit)
            - vitamins_and_minerals: Please include key vitamins (A, C, D, etc.) and minerals (calcium, iron, etc.) with their amounts and units
            - potential_allergens (array of strings)
            - health_assessment: A brief assessment (1-2 sentences) of how healthy this food choice is and why (string)
            
            Format as VALID JSON with the following exact structure:
            {{
              "food_name": "string",
              "portion_size": "string",
              "calories": number,
              "protein": "string",
              "carbohydrates": "string",
              "fat": "string",
              "fiber": "string",
              "vitamins_and_minerals": {{
                "vitamin_a": "string",
                "vitamin_c": "string",
                "calcium": "string",
                "iron": "string",
                ... (other vitamins/minerals)
              }},
              "potential_allergens": ["string", "string", ...],
              "health_assessment": "string"
            }}
            
            Use null for unknown values, never use placeholder values.
            """
            
            # Use text-only model for this request
            text_model = genai.GenerativeModel('models/gemini-1.5-pro')
            
            # Generate response from Gemini
            response = text_model.generate_content(prompt)
            
            # Extract the response text
            response_text = response.text
            
            # Clean up the response to extract only valid JSON
            # Remove markdown code blocks if present
            clean_text = re.sub(r'```(?:json)?\s*(.*?)\s*```', r'\1', response_text, flags=re.DOTALL)
            
            # Find the first occurrence of '{' and the last occurrence of '}'
            start_idx = clean_text.find('{')
            end_idx = clean_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_text = clean_text[start_idx:end_idx+1]
                
                # Replace any remaining {object} placeholders with null
                json_text = re.sub(r'\{\s*object\s*\}', 'null', json_text)
                
                # Add additional cleaning for object notation
                json_text = re.sub(r'\[object Object\]', 'null', json_text)
                
                # Parse JSON to validate it
                parsed_data = json.loads(json_text)
                
                return {
                    "success": True,
                    "data": json_text
                }
            else:
                return {
                    "success": False,
                    "error": "Could not extract valid JSON from response"
                }
                
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}"
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
            
            # Create a more direct prompt with stronger guidance
            prompt = """
            You are a nutritional analysis expert. First identify what food is in this image, then provide realistic nutritional data based on standard nutritional databases.

            Even if you're unsure about exact values, provide reasonable estimates based on standard nutrition data for the identified food.
            
            Include:
            - Food name: Be specific about what you see
            - Portion size: Provide a reasonable estimate (e.g., "1 cup", "3 oz")
            - Calories: Provide a numeric estimate based on standard nutrition data
            - Macronutrients: Include reasonable estimates for protein, carbs, and fat with units
            - Vitamins & minerals: Include at least 3-5 key nutrients typically found in this food
            - Potential allergens: List common allergens in this food
            - Health assessment: Provide a brief assessment of nutritional benefits/concerns
            
            Format as VALID JSON with the following structure:
            {
              "food_name": "Specific Food Name",
              "portion_size": "Estimated Portion",
              "calories": 150,
              "protein": "10g",
              "carbohydrates": "15g",
              "fat": "5g",
              "fiber": "2g",
              "vitamins_and_minerals": {
                "vitamin_a": "100 IU",
                "vitamin_c": "5 mg",
                "calcium": "20 mg",
                "iron": "1.5 mg",
                "potassium": "200 mg"
              },
              "potential_allergens": ["allergen1", "allergen2"],
              "health_assessment": "Nutritional assessment of this food"
            }
            
            Ensure all nutritional values are realistic estimates based on food databases, not zeros or nulls.
            """
            
            # Use vision-capable model with adjusted parameters
            vision_model = genai.GenerativeModel('models/gemini-1.5-pro',
                                               generation_config={
                                                   "temperature": 0.2,  # Lower temperature for more factual outputs
                                                   "top_p": 0.95,
                                                   "top_k": 40,
                                                   "max_output_tokens": 4096,  # Allow longer responses
                                               })
            
            # Generate response
            response = vision_model.generate_content([prompt, img])
            
            # Extract response text
            response_text = response.text
            
            # Clean up the response to extract only valid JSON
            # Remove markdown code blocks if present
            clean_text = re.sub(r'```(?:json)?\s*(.*?)\s*```', r'\1', response_text, flags=re.DOTALL)
            
            # Find the first occurrence of '{' and the last occurrence of '}'
            start_idx = clean_text.find('{')
            end_idx = clean_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_text = clean_text[start_idx:end_idx+1]
                
                # Replace any remaining {object} placeholders with null
                json_text = re.sub(r'\{\s*object\s*\}', 'null', json_text)
                
                # Parse JSON to validate it
                parsed_data = json.loads(json_text)
                
                return {
                    "success": True,
                    "data": json_text
                }
            else:
                return {
                    "success": False,
                    "error": "Could not extract valid JSON from response"
                }
                
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
