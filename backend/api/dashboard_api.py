from fastapi import APIRouter, Query
from typing import Optional

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
 
