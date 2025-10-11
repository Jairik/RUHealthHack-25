''' FastAPI endpoints here '''

from fastapi import FastAPI
from backend import pydantic_models as models
from backend.queries import AWS_queries as aws_queries
from backend.queries.AWS_connect import connect_to_aws

# Initialize FastAPI app
app = FastAPI()

# Define the AWS client globally
s3_client = connect_to_aws('s3')

# Define a patient class
patient_info = models.patientInfo()

# Basic example endpoint
@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/get_user_info")
def get_user_info(user: models.getUser):
    ''' Endpoint to get patient history, given patient first name, last name, and DOB '''
    patient_info = aws_queries.get_patient_history(s3_client, user.first_name, user.last_name, user.dob)
    