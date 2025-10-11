''' FastAPI endpoints here '''

from fastapi import FastAPI
import * from backend.pydantic_models as models
import * from backend.queries.AWS_queries as aws_queries
from backend.queries.AWS_connect import connect_to_aws

# Initialize FastAPI app
app = FastAPI()

# Define the AWS client globally
s3_client = connect_to_aws('s3')

# Basic example endpoint
@app.get("/api/health")
def health():
    return {"ok": True}

# Endpoint for validating the user
@app.post("/api/auth_user", response_model=models.getUser)
def get_user(user_request: models.getUserRequest):
    # Would call AWS Cognito here
    user_data = aws_queries.get_user_from_db(user_request.user_id)
    return models.getUser(**user_data)