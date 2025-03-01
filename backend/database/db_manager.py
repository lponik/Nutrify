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