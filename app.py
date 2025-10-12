''' FastAPI endpoints here '''

from fastapi import FastAPI, APIRouter, Query
from fastapi.middleware.cors import CORSMiddleware
from backend import pydantic_models as models
from backend.queries.table_creation.AWS_connect import get_rds_client, get_envs
from backend.model_inference import inference
from typing import Optional
from backend.api.dashboard_api import router as dashboard_router

# Initialize FastAPI app
app = FastAPI()

#incude routers
app.include_router(dashboard_router)

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

from queries.dashboard_query import (
    q_total_triages, q_cases_today, q_cases_this_week,
    q_search_triages, q_mark_sent_to_epic
)
from models.dashboard_model import (
    DashboardStats, TriageListResponse, TriageSummary
)

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats():
    return {
        "total": q_total_triages(),
        "today": q_cases_today(),
        "this_week": q_cases_this_week(),
    }

@router.get("/triages", response_model=TriageListResponse)
def list_triages(
    q: Optional[str] = Query(None, description="Search by patient name, agent id, or case number"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200)
):
    return q_search_triages(q, page, page_size)

@router.post("/triages/{triage_id}/send-to-epic", response_model=TriageSummary)
def send_to_epic(triage_id: int):
    updated = q_mark_sent_to_epic(triage_id)
    # fetch transformed row via search (reuses shaping)
    one = q_search_triages(term=f"TRG-{str(triage_id).zfill(3)}", page=1, page_size=1)
    if one["items"]:
        return one["items"][0]
    # fallback: minimal object if search didn’t find it (shouldn’t happen)
    return TriageSummary(
        id=str(updated["triage_id"]) if updated else str(triage_id),
        case_number=f"TRG-{str(triage_id).zfill(3)}",
        agent_id=0,
        created_date="",
        confidence_score=0,
        subspecialist_confidences=[],
        status="completed",
        sent_to_epic=True,
        epic_sent_date=str(updated.get("epic_sent_date")) if updated else None
    )