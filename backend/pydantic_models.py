''' Pydantic models for the backend API, standardizing data structures. '''

from pydantic import BaseModel, Field

# Example model for now
class Example(BaseModel):
    id: int = Field(..., description="Unique identifier for the example")
    name: str = Field(..., description="Name of the example")
    description: str = Field(None, description="Optional description of the example")

class getUser(BaseModel):
    first_name: str = Field(None, description="First name of the user")
    last_name: str = Field(None, description="Last name of the user")
    dob: str = Field(None, description="Date of birth of the user")
    
class patientInfo(BaseModel):
    patient_id: str = Field(..., description="Unique identifier for the patient")
    first_name: int = Field(..., description="First name of the patient")
    last_name: str = Field(..., description="Last name of the patient")
    dob: str = Field(..., description="Date of birth of the patient")
    patient_history: str = Field(..., description="Medical history of the patient")
    