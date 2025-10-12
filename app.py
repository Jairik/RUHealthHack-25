''' FastAPI endpoints here '''

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend import pydantic_models as models
from backend.queries.table_creation.AWS_connect import get_rds_client, get_envs
from backend.model_inference import inference

from backend.api.dashboard_api import router as dashboard_router

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
    if(True):#aws_queries.check_patient_exists(s3_client, user.first_name, user.last_name, user.dob) == False):
        # TODO Logic here to add to the DB
        patient_history: str = ""
    # If found, get the patient history
    else:
        patient_history: str = aws_queries.get_patient_history(s3_client, user.first_name, user.last_name, user.dob)
    inference(user_text=patient_history, first_call=True)
    return { "success": True }

@app.post("/api/get_question")
def get_question(r: str | int = None):
    ''' Endpoint to pass in results and get the next question and the results ''' 
    if(isinstance(r, str)):
        results: dict = inference(user_text=r)
    else:
        results: dict = inference(last_ans=r)
    return { "results": results }