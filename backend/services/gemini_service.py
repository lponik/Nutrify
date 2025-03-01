import requests
import os

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.api_url = 'https://api.gemini.com/v1/analyze'

    def analyze_food_image(self, image_path):
        with open(image_path, 'rb') as image_file:
            files = {'file': image_file}
            headers = {'Authorization': f'Bearer {self.api_key}'}
            response = requests.post(self.api_url, headers=headers, files=files)
            if response.status_code == 200:
                return response.json()
            else:
                response.raise_for_status()