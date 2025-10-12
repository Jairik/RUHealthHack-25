# backend/queries/referral_builder.py
from __future__ import annotations
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from .general_queries import run_query

# Decoding helpers for RDS Data APIs
def _cell(field: Dict[str, Any]) -> Any:
    if not field:
        return None
    if field.get("isNull"):
        return None
    for k in ("stringValue", "longValue", "doubleValue", "booleanValue"):
        if k in field: return field[k]
    return None

def _row(rec: List[Dict[str, Any]]) -> List[Any]:
    return [_cell(c) for c in rec]

# Fetch everything we need for one triage
def fetch_triage_bundle(triage_id: int) -> Optional[Dict[str, Any]]:
    sql = """
    SELECT
      t.triage_id, t.agent_id, t.client_id, t.date_time,
      t.re_conf, t.mfm_conf, t.uro_conf, t.gob_conf, t.mis_conf, t.go_conf,
      t.doc_id1, t.doc_id2, t.doc_id3,
      t.agent_notes,

      c.client_fn, c.client_ln, c.client_dob,

      d1.doc_fn AS doc1_fn, d1.doc_ln AS doc1_ln,
      d2.doc_fn AS doc2_fn, d2.doc_ln AS doc2_ln,
      d3.doc_fn AS doc3_fn, d3.doc_ln AS doc3_ln

    FROM triage t
    JOIN client c ON c.client_id = t.client_id
    LEFT JOIN doctor d1 ON d1.doc_id = t.doc_id1
    LEFT JOIN doctor d2 ON d2.doc_id = t.doc_id2
    LEFT JOIN doctor d3 ON d3.doc_id = t.doc_id3
    WHERE t.triage_id = :tid;
    """
    resp = run_query(sql, [{"name":"tid","value":{"longValue": triage_id}}])
    recs = resp.get("records") or []
    if not recs:
        return None

    (
        triage_id, agent_id, client_id, date_time,
        re_conf, mfm_conf, uro_conf, gob_conf, mis_conf, go_conf,
        doc_id1, doc_id2, doc_id3,
        agent_notes,
        client_fn, client_ln, client_dob,
        doc1_fn, doc1_ln, doc2_fn, doc2_ln, doc3_fn, doc3_ln
    ) = _row(recs[0])

    return {
        "triage": {
            "triage_id": triage_id,
            "agent_id": agent_id,
            "client_id": client_id,
            "date_time": date_time,  # ISO from DB
            "re_conf": int(re_conf or 0),
            "mfm_conf": int(mfm_conf or 0),
            "uro_conf": int(uro_conf or 0),
            "gob_conf": int(gob_conf or 0),
            "mis_conf": int(mis_conf or 0),
            "go_conf":  int(go_conf  or 0),
            "doc_id1": doc_id1, "doc_id2": doc_id2, "doc_id3": doc_id3,
            "agent_notes": agent_notes or "",
        },
        "client": {
            "client_id": client_id,
            "first": client_fn, "last": client_ln, "dob": client_dob,
        },
        "doctors": [
            {"doc_id": doc_id1, "fn": doc1_fn, "ln": doc1_ln} if doc_id1 else None,
            {"doc_id": doc_id2, "fn": doc2_fn, "ln": doc2_ln} if doc_id2 else None,
            {"doc_id": doc_id3, "fn": doc3_fn, "ln": doc3_ln} if doc_id3 else None,
        ]
    }

# Six subspecialties
CANON_SPECIALTIES = [
    ("mfm_conf", "Maternal Fetal Medicine"),
    ("uro_conf", "Urogynecology & Reconstructive Pelvic Medicine"),
    ("mis_conf", "Complex/Minimally Invasive Gynecologic Surgery"),
    ("re_conf",  "Reproductive Endocrinology"),
    ("go_conf",  "Gynecologic Oncology"),
    ("gob_conf", "General OB/GYN"),
]

def infer_specialty_ranked(triage_row: Dict[str, Any]) -> Dict[str, Any]:
    scored = []
    for col, label in CANON_SPECIALTIES:
        v = int(triage_row.get(col, 0) or 0)
        scored.append({"column": col, "label": label, "score": v})
    scored.sort(key=lambda x: x["score"], reverse=True)
    top = scored[0] if scored else {"column":"gob_conf","label":"General OB/GYN","score":0}
    return {"top": top, "ranked": scored}

# Build a FHIR-like Appointment JSON (POC/download)
def build_referral_json(triage_id: int) -> Optional[Dict[str, Any]]:
    bundle = fetch_triage_bundle(triage_id)
    if not bundle:
        return None

    t = bundle["triage"]
    c = bundle["client"]
    docs = [d for d in bundle["doctors"] if d]

    spec = infer_specialty_ranked(t)
    created = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z")

    participants = [{
        "actor": { "reference": f"Patient/{c['client_id']}", "display": f"{c['first']} {c['last']}" },
        "status": "needs-action",
        "type": [{ "text": "patient" }]
    }]
    for d in docs:
        participants.append({
            "actor": { "reference": f"Practitioner/{d['doc_id']}", "display": f"Dr. {d['fn']} {d['ln']}".strip() },
            "status": "needs-action",
            "type": [{ "text": "practitioner" }]
        })

    # Appointment payload for POC export
    payload = {
        "resourceType": "Appointment",
        "status": "proposed",
        "created": created,
        "serviceType": [{ "text": spec["top"]["label"] }],
        "description": f"Referral from automated triage (triage_id={t['triage_id']})",
        "reasonCode": [{ "text": (t["agent_notes"] or "").strip()[:512] }],
        "participant": participants,
        # Carry the scores for auditability
        "extension": [{
            "url": "https://example.org/fhir/StructureDefinition/triage-subspecialty-scores",
            "valueString": {s["column"]: s["score"] for s in spec["ranked"]}
        }],
        # Tiny patient slice
        "supportingInformation": [{
            "reference": f"Patient/{c['client_id']}",
            "display": f"{c['first']} {c['last']} (DOB {c['dob']})"
        }]
    }
    return payload
