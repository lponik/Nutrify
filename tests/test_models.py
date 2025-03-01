from backend.database.models import YourModel  # Replace with your actual model
import pytest

@pytest.fixture
def sample_model():
    # Create a sample instance of YourModel for testing
    model_instance = YourModel(field1='value1', field2='value2')  # Adjust fields as necessary
    return model_instance

def test_model_creation(sample_model):
    assert sample_model is not None
    assert sample_model.field1 == 'value1'
    assert sample_model.field2 == 'value2'

def test_model_str(sample_model):
    assert str(sample_model) == 'Expected String Representation'  # Adjust as necessary

def test_model_save(sample_model):
    # Assuming you have a session to add the model instance
    from backend.database.db_manager import session  # Adjust import as necessary
    session.add(sample_model)
    session.commit()
    
    # Fetch the model instance from the database
    fetched_model = session.query(YourModel).filter_by(field1='value1').first()
    assert fetched_model is not None
    assert fetched_model.field1 == 'value1'