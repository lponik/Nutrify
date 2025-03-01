from flask import Blueprint, request, jsonify
from backend.database.models import User
from backend.database.db_manager import create_user, get_user_by_email
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if get_user_by_email(email):
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password, method='sha256')
    user = create_user(email=email, password=hashed_password)

    return jsonify({'message': 'User registered successfully', 'user_id': user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = get_user_by_email(email)
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)

def create_record(model, **kwargs):
    record = model(**kwargs)
    db.session.add(record)
    db.session.commit()
    return record

def read_record(model, record_id):
    return model.query.get(record_id)

def update_record(record, **kwargs):
    for key, value in kwargs.items():
        setattr(record, key, value)
    db.session.commit()
    return record

def delete_record(record):
    db.session.delete(record)
    db.session.commit()

# Add the functions that auth_routes is looking for
def create_user(email, password, name=None):
    """Placeholder for create_user function"""
    # This is just a placeholder to prevent import errors
    print("Warning: using placeholder create_user function")
    return None

def get_user_by_email(email):
    """Placeholder for get_user_by_email function"""
    # This is just a placeholder to prevent import errors
    print("Warning: using placeholder get_user_by_email function")
    return None