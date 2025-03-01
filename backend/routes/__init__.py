from flask import Blueprint

# Initialize the routes blueprint
routes_bp = Blueprint('routes', __name__)

# Import routes to register them
from .auth_routes import *
from .food_routes import *
from .tracking_routes import *