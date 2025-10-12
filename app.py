''' FastAPI endpoints here '''

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from backend import pydantic_models as models
from backend.queries.table_creation.AWS_connect import get_rds_client, get_envs
from backend.queries.dashboard_query import (
    q_total_triages, q_cases_today, q_cases_this_week,
    q_search_triages, q_mark_sent_to_epic
)
from backend.model_inference import inference

from backend.model import dashboard_model as model

from typing import Optional
# from backend.api.dashboard_api import router as dashboard_router
#backend/queries/dashboard_query.py
from backend.queries import dashboard_query as query

from datetime import datetime
from typing import Any, Dict, Optional

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

@app.get("/api/dashboard/stats", response_model=model.DashboardStats)
def dashboard_stats():
    return {
        "total": q_total_triages(),
        "today": q_cases_today(),
        "this_week": q_cases_this_week(),
    }

@app.get("/api/triages", response_model=None)  # temporarily drop response_model to avoid 500 during coercion
def list_triages(
    q: Optional[str] = Query(None, description="Search by patient name, agent id, or case number"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    data = q_search_triages(q, page, page_size)

    # If helper already returns the correct envelope, normalize dates and return.
    if isinstance(data, dict) and "items" in data:
        items = []
        for it in data["items"]:
            it = dict(it)  # make mutable copy
            # unify id as string; accept triage_id as fallback
            if "id" not in it:
                if "triage_id" in it:
                    it["id"] = str(it["triage_id"])
                else:
                    it["id"] = str(it.get("id", ""))
            # case_number fallback
            it.setdefault("case_number", f"TRG-{it['id'].zfill(3) if isinstance(it['id'], str) and it['id'].isdigit() else it['id']}")
            # created_date: coerce datetime -> ISO string; fall back from date_time
            if "created_date" in it and isinstance(it["created_date"], datetime):
                it["created_date"] = it["created_date"].isoformat()
            elif "date_time" in it and isinstance(it["date_time"], datetime):
                it["created_date"] = it["date_time"].isoformat()
            else:
                it.setdefault("created_date", datetime.utcnow().isoformat())

            # subspecialist_confidences may already be array or JSON string; normalize to array
            val = it.get("subspecialist_confidences")
            if isinstance(val, str):
                try:
                    import json
                    it["subspecialist_confidences"] = json.loads(val)
                except Exception:
                    it["subspecialist_confidences"] = []
            elif not isinstance(val, list):
                it["subspecialist_confidences"] = []

            # booleans default
            it["sent_to_epic"] = bool(it.get("sent_to_epic", False))

            items.append(it)

        total = data.get("total", len(items))
        total_pages = data.get("total_pages", (total + page_size - 1) // page_size)
        return {
            "items": items,
            "page": data.get("page", page),
            "page_size": data.get("page_size", page_size),
            "total": total,
            "total_pages": total_pages,
        }

    # If helper returned a list (legacy), wrap it into the expected envelope.
    if isinstance(data, list):
        items = []
        for idx, it in enumerate(data, 1):
            it = dict(it)
            if "id" not in it:
                if "triage_id" in it:
                    it["id"] = str(it["triage_id"])
                else:
                    it["id"] = str(idx)
            it.setdefault("case_number", f"TRG-{str(it['id']).zfill(3)}")
            if "created_date" in it and isinstance(it["created_date"], datetime):
                it["created_date"] = it["created_date"].isoformat()
            elif "date_time" in it and isinstance(it["date_time"], datetime):
                it["created_date"] = it["date_time"].isoformat()
            else:
                it.setdefault("created_date", datetime.utcnow().isoformat())
            if not isinstance(it.get("subspecialist_confidences"), list):
                it["subspecialist_confidences"] = []
            it["sent_to_epic"] = bool(it.get("sent_to_epic", False))
            items.append(it)

        total = len(items)
        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
        }

    # If something else came back, surface it for now to avoid opaque 500s.
    return {"items": [], "page": page, "page_size": page_size, "total": 0, "total_pages": 0}