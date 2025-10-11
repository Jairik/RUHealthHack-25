''' FastAPI endpoints here '''

from fastapi import FastAPI
from backend import pydantic_models as models
from backend.queries.table_creation.AWS_connect import get_rds_client, get_envs
from backend.model_inference import inference

# Initialize FastAPI app
app = FastAPI()

# Define a patient class
# patient_info = models.patientInfo()

# Basic example endpoint
@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/get_user_info")
def get_user_info(user: models.getUser):
    ''' Endpoint to get patient history, given patient first name, last name, and DOB '''
    # First, check if the patient is found
    if(aws_queries.check_patient_exists(s3_client, user.first_name, user.last_name, user.dob) == False):
        return {"error": "Patient not found"}
    # If found, get the patient history
    patient_history: str = aws_queries.get_patient_history(s3_client, user.first_name, user.last_name, user.dob)
    inference(user_text=patient_history, first_call=True)
    
# @app.post("/api/get_patient_info")