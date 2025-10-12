''' FastAPI endpoints here '''

from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from backend import pydantic_models as models
from backend.queries.table_creation.AWS_connect import get_rds_client, get_envs
from backend.queries.dashboard_query import (
    q_total_triages, q_cases_today, q_cases_this_week,
    q_search_triages, q_mark_sent_to_epic
)
from backend.model_inference import inference

from backend.model import dashboard_model as model
from backend.model import triage_model as triage
from backend.queries import general_queries as gq
from typing import Any, Optional
from fastapi import FastAPI, Body, HTTPException
from typing import Optional
from backend.queries import dashboard_query as query
from backend.queries import general_queries as gq

from datetime import datetime
from typing import Any, Dict, Optional, List

from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_methods=["*"],   # includes OPTIONS for preflight
    allow_headers=["*"],   # allow Content-Type: application/json, etc.
    allow_credentials=False,  # keep False unless you actually send cookies/auth
)

# Define a patient class
# patient_info = models.patientInfo()

# Basic example endpoint
@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/get_user_info")
<<<<<<< HEAD
def get_user_info(user: Any = Body(...)):
    # Minimal happy-path payload that your UI understands
    return {
        "results": {
            "question": "What is the primary reason for today's call?\n Are you currently pregnant?\n Do you have any abnormal bleeding?",
            "subspecialty_results": [],
            "condition_results": [],
            "doctor_results": {}
        }
    }
=======
def get_user_info(user: Any = Body(...)):
    ''' Endpoint to get patient history, given patient first name, last name, and DOB '''
    # First, check if the patient is found
    if(gq.validateClientExists(user.first_name, user.last_name, user.dob) == False):
        gq.addUserInfo(user.first_name, user.last_name, user.dob)
        patient_history: str = ""
    else:
        patient_history: str = aws_queries.get_patient_history(s3_client, user.first_name, user.last_name, user.dob)
    # Initial model call to set up patient 'context'
    inference(user_text=patient_history, first_call=True)
    return { "success": True }

@app.post("/api/get_question")
def get_question(payload: Any = Body(...)):
    """
    Accepts:
      - 5                      -> last_ans=5
      - "free text"            -> user_text="free text"
      - {"last_ans": 1}        -> last_ans=1
      - {"user_text": "hi"}    -> user_text="hi"
      - {"last_ans": 1, "user_text": "hi"} -> both
    """
    last_ans: Optional[int] = None
    user_text: Optional[str] = ''

    if isinstance(payload, dict):
        la = payload.get("last_ans", -1)
        ut = payload.get("user_text", '')
        # map int to last_ans (avoid treating bool as int)
        if isinstance(la, int) and not isinstance(la, bool):
            last_ans = la
        # map str to user_text
        if isinstance(ut, str):
            ut = ut.strip()
            user_text = ut if ut else ''

    elif isinstance(payload, int) and not isinstance(payload, bool):
        last_ans = payload

    elif isinstance(payload, str):
        s = payload.strip()
        user_text = s if s else ''

    print(user_text, last_ans)

    # choose which branch to run (prefer user_text if both are present)
    if user_text!='':
        results: dict = inference(user_text=user_text, last_ans=last_ans)
    elif user_text=='':
        results: dict = inference(last_ans=last_ans)
    else:
        raise HTTPException(status_code=422, detail="Provide an int (last_ans) and/or a string (user_text).")

    return {"results": results}


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

@app.post("/api/triage/start", response_model=triage.StartTriageResponse)
def api_start_triage(req: triage.StartTriageRequest):
    """
    1) create or find client
    2) create triage row with agent_id + client_id
    """
    client_id = gq.q_get_or_create_client(
        req.client_first_name.strip(),
        req.client_last_name.strip(),
        req.client_dob.strip(),
    )
    triage_id = gq.q_start_triage(req.agent_id, client_id)
    return {"triage_id": triage_id, "client_id": client_id}

@app.post("/api/triage/answer", response_model=triage.AnswerResponse)
def api_answer(req: triage.AnswerRequest):
    """
    1) write Q/A to triage_question
    2) run model inference to get updated confidences and top doctors
    3) persist those updates on triage row
    4) return the next question + current state to the frontend
    """
    # 1) persist Q/A
    gq.q_insert_triage_question(req.triage_id, req.question, req.answer)

    # 2) inference - your file already exposes `inference()` used elsewhere
    #    It returns a dict with "subspecialty_results" and "doctor_results" + maybe "next_question"
    result = inference(user_text=req.answer)

    # 3) persist updated confidences + doctor picks
    subs = result.get("subspecialty_results") or []
    docs = result.get("doctor_results") or []
    gq.q_update_triage_from_inference(req.triage_id, subs, docs)

    # 4) shape response
    return {
        "triage_id": req.triage_id,
        "next_question": result.get("next_question"),
        "subspecialty_results": [
            {"subspecialty_name": s.get("subspecialty_name", ""), "percent_match": int(float(s.get("percent_match", 0)))}
            for s in subs
        ],
        "doctor_results": [
            {"rank": d.get("rank", ""), "name": d.get("name", "")}
            for d in docs
        ],
    }

@app.post("/api/triage/end")
def api_end_triage(req: triage.EndTriageRequest):
    """
    Finalize triage: store optional agent notes.
    """
    gq.q_end_triage(req.triage_id, req.agent_notes)
    return {"ok": True}