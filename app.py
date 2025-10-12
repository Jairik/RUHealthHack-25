# ---------- FastAPI endpoints here ----------

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend import pydantic_models as models  # (unused right now but kept)
from backend.model import dashboard_model as model
from backend.model import triage_model as triage
from backend.model_inference import inference
from backend.queries import general_queries as gq
from backend.queries.dashboard_query import (
    q_total_triages,
    q_cases_today,
    q_cases_this_week,
    q_search_triages,
    q_mark_sent_to_epic,  # not used here but keep import for other pages
)

# ---------------- App & CORS ----------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ---------------- Utilities ----------------

def _as_percent_int(v) -> int:
    try:
        f = float(v)
    except Exception:
        return 0
    # model gives 0..1; store/display as 0..100 int
    return int(round(100 * f)) if f <= 1.0 else int(round(f))

def _normalize_doctor_results(docs_any) -> list[dict]:
    """
    Accepts dict {'Best Match': 'Smith', 'Second Match': 'Chen', ...}
    or already-normalized list, and returns a list of {'rank': 'Top 1', 'name': 'Smith'}.
    """
    if isinstance(docs_any, list):
        return docs_any
    if isinstance(docs_any, dict):
        order = [
            ("Top 1", docs_any.get("Best Match")),
            ("Top 2", docs_any.get("Second Match")),
            ("Top 3", docs_any.get("Third Match")),
        ]
        return [{"rank": r, "name": n} for r, n in order if n]
    return []


# ---------------- Health ----------------

@app.get("/api/health")
def health():
    return {"ok": True}

# ---------------- Page 1 bootstrap ----------------

@app.post("/api/get_user_info")
def get_user_info(user: Any = Body(...)):
    # Minimal envelope your UI expects; real lookup can be added later.
    return {
        "results": {
            "question": "What is the primary reason for today's call?\n Are you currently pregnant?\n Do you have any abnormal bleeding?",
            "subspecialty_results": [],
            "condition_results": [],
            "doctor_results": {},
        }
    }

# ---------------- Optional stub used by your dev flow ----------------

class AnswerIn(BaseModel):
    user_text: Optional[str] = ""
    last_ans: Optional[int] = -1  # yes=1, no=0, skip=-1

@app.post("/api/get_question")
def get_question(payload: AnswerIn):
    next_question = (
        "Have you noticed any patterns or triggers?"
        if (payload.last_ans or -1) == 1
        else "Are you currently taking any medications?"
    )
    subspecialty_results = [
        {"subspecialty_name": "Reproductive Endocrinology", "subspecialty_short": "REI", "rank": 1, "percent_match": 0.62},
        {"subspecialty_name": "General Obstetrics",         "subspecialty_short": "OB",  "rank": 2, "percent_match": 0.23},
        {"subspecialty_name": "Maternal Fetal Medicine",    "subspecialty_short": "MFM","rank": 3, "percent_match": 0.15},
    ]
    condition_results = [
        {"condition": "PCOS",          "probability": 0.55},
        {"condition": "Fibroids",      "probability": 0.20},
        {"condition": "Endometriosis", "probability": 0.10},
    ]
    doctor_results = {"top1": "Smith", "top2": "Chen", "top3": "Patel"}

    return {
        "results": {
            "question": next_question,
            "subspecialty_results": subspecialty_results,
            "condition_results": condition_results,
            "doctor_results": doctor_results,
        }
    }

# ---------------- Dashboard APIs (keep as-is) ----------------

@app.get("/api/dashboard/stats", response_model=model.DashboardStats)
def dashboard_stats():
    return {
        "total": q_total_triages(),
        "today": q_cases_today(),
        "this_week": q_cases_this_week(),
    }

@app.get("/api/triages", response_model=None)  # keep flexible to avoid coercion issues
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
            it = dict(it)
            if "id" not in it:
                if "triage_id" in it:
                    it["id"] = str(it["triage_id"])
                else:
                    it["id"] = str(it.get("id", ""))
            it.setdefault("case_number", f"TRG-{it['id'].zfill(3) if isinstance(it['id'], str) and it['id'].isdigit() else it['id']}")
            if "created_date" in it and isinstance(it["created_date"], datetime):
                it["created_date"] = it["created_date"].isoformat()
            elif "date_time" in it and isinstance(it["date_time"], datetime):
                it["created_date"] = it["date_time"].isoformat()
            else:
                it.setdefault("created_date", datetime.utcnow().isoformat())

            # If some helper returns JSON in a string, try to parse; otherwise default to []
            val = it.get("subspecialist_confidences")
            if isinstance(val, str):
                try:
                    import json
                    it["subspecialist_confidences"] = json.loads(val)
                except Exception:
                    it["subspecialist_confidences"] = []
            elif not isinstance(val, list):
                it["subspecialist_confidences"] = []

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

    # Legacy list → wrap
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

    return {"items": [], "page": page, "page_size": page_size, "total": 0, "total_pages": 0}

# ---------------- Triage lifecycle ----------------

@app.post("/api/triage/start", response_model=triage.StartTriageResponse)
def api_start_triage(req: triage.StartTriageRequest):
    client_id = gq.q_get_or_create_client(
        req.client_first_name.strip(),
        req.client_last_name.strip(),
        req.client_dob.strip(),
    )
    triage_id = gq.q_start_triage(req.agent_id, client_id)  # <-- req.agent_id is INT
    # optional: seed/reset your model per triage if you want
    inference(user_text="", first_call=True)
    return {"triage_id": triage_id, "client_id": client_id}

# NOTE: drop response_model here so we can include `condition_results` exactly as model returns
@app.post("/api/triage/answer")
def api_answer(req: triage.AnswerRequest):
    try:
        # 1) persist Q/A
        gq.q_insert_triage_question(req.triage_id, req.question, req.answer)

        # 2) run model; it needs last_ans to advance
        print(f"Calling inference with: user_text='{req.answer}', last_ans={req.last_ans}")
        result = inference(user_text=req.answer, last_ans=(req.last_ans or -1)) or {}
        print(f"Inference result: {result}")

        subs = result.get("subspecialty_results") or []
        conds = result.get("condition_results") or []
        docs_raw = result.get("doctor_results")

        # normalize doctors -> list[{rank,name}]
        def _normalize_doctors(x):
            if isinstance(x, dict):
                # Model returns {"Best Match": "Name", "Second Match": "Name", ...}
                order = [
                    (1, x.get("Best Match")),
                    (2, x.get("Second Match")),
                    (3, x.get("Third Match"))
                ]
                return [{"rank": rank, "name": n} for rank, n in order if n]
            if isinstance(x, list):
                # Already a list, ensure rank is int
                return [{"rank": int(str(d.get("rank", i + 1)).replace("Top ", "")), "name": d.get("name", "")} for i, d in enumerate(x)]
            return []

        docs = _normalize_doctors(docs_raw)

        # 3) persist subspecialist confidences + top-3 doctors
        gq.q_update_triage_from_inference(req.triage_id, subs, conds, docs)

        # 4) shape response (subspecialist percent -> 0–100 int)
        def _as_pct(v):
            try:
                f = float(v)
            except Exception:
                return 0
            return int(round(f * 100)) if 0.0 <= f <= 1.0 else int(round(f))

        subs_out = [
            {
                "subspecialty_name": s.get("subspecialty_name", ""),
                "subspecialty_short": s.get("subspecialty_short", ""),
                "rank": s.get("rank", 0),
                "percent_match": _as_pct(s.get("percent_match", 0)),
            } for s in subs
        ]

        # CRITICAL: your model returns 'question', not 'next_question'
        next_q = result.get("question")
        if not isinstance(next_q, str) or not next_q.strip():
            raise HTTPException(status_code=500, detail="Model did not return 'question'")

        # For frontend response, convert rank back to "Top 1" format
        docs_out = [{"rank": f"Top {d['rank']}", "name": d["name"]} for d in docs]

        return {
            "triage_id": req.triage_id,
            "next_question": next_q,
            "subspecialty_results": subs_out,
            "condition_results": conds,
            "doctor_results": docs_out,  # Use formatted version for frontend
        }
    
    except Exception as e:
        print(f"ERROR in api_answer: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing answer: {str(e)}")


@app.post("/api/triage/end")
def api_end_triage(req: triage.EndTriageRequest):
    gq.q_end_triage(req.triage_id, req.agent_notes)
    return {"ok": True}