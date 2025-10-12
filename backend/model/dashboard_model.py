from typing import List, Optional
from pydantic import BaseModel

class SubspecialistConfidence(BaseModel):
    name: str
    confidence: int

class TriageSummary(BaseModel):
    id: str
    case_number: str
    agent_id: int
    patient_first_name: Optional[str] = None
    patient_last_name: Optional[str] = None
    patient_dob: Optional[str] = None
    created_date: str
    health_history: List[str] = []
    conversation_history: List[dict] = []
    final_recommendation: Optional[str] = None
    confidence_score: int
    recommended_doctor: Optional[str] = None
    subspecialist_confidences: List[SubspecialistConfidence]
    status: Optional[str] = "completed"
    agent_notes: Optional[str] = None
    sent_to_epic: bool = False
    epic_sent_date: Optional[str] = None

class TriageListResponse(BaseModel):
    items: List[TriageSummary]
    page: int
    page_size: int
    total: int
    total_pages: int

class DashboardStats(BaseModel):
    total: int
    today: int
    this_week: int
