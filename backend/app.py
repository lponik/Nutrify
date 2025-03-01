from flask import Flask
from backend.config import Config
from backend.routes import auth_routes, food_routes, tracking_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(food_routes.bp)
    app.register_blueprint(tracking_routes.bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)