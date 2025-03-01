from flask import Flask, jsonify
import unittest

class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

    def test_health_check(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'status': 'healthy'})

    def test_nutrient_analysis(self):
        # Assuming there's an endpoint for nutrient analysis
        response = self.client.post('/api/analyze', json={'image_url': 'http://example.com/food.jpg'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('nutrients', response.json)

if __name__ == '__main__':
    unittest.main()