from typing import List, Optional
from pydantic import BaseModel

class StartTriageRequest(BaseModel):
    agent_id: int
    client_first_name: str
    client_last_name: str
    client_dob: str  # 'YYYY-MM-DD'

class StartTriageResponse(BaseModel):
    triage_id: int
    client_id: int

class AnswerRequest(BaseModel):
    triage_id: int
    question: str
    answer: str

class SubspecialtyConfidence(BaseModel):
    subspecialty_name: str
    percent_match: int

class DoctorPick(BaseModel):
    rank: str
    name: str

class AnswerResponse(BaseModel):
    triage_id: int
    next_question: Optional[str] = None
    subspecialty_results: List[SubspecialtyConfidence] = []
    doctor_results: List[DoctorPick] = []

class EndTriageRequest(BaseModel):
    triage_id: int
    agent_notes: Optional[str] = None
