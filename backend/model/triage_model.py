from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class StartTriageRequest(BaseModel):
    agent_id: int
    client_first_name: str
    client_last_name: str
    client_dob: str  # YYYY-MM-DD
    timestamp: Optional[str] = None  # ISO 8601 format, e.g. "2024-01-01T12:00:00Z"

class StartTriageResponse(BaseModel):
    triage_id: int
    client_id: int

class AnswerRequest(BaseModel):
    triage_id: int
    question: str
    answer: str
    last_ans: Optional[int] = -1  # yes=1, no=0, skip=-1

class AnswerResponse(BaseModel):
    triage_id: int
    next_question: str
    subspecialty_results: List[Dict[str, Any]]
    condition_results: List[Dict[str, Any]]
    doctor_results: List[Dict[str, Any]]

class EndTriageRequest(BaseModel):
    triage_id: int
    agent_notes: Optional[str] = None
