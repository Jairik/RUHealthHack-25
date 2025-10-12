# backend/queries/general_queries.py
import json
from typing import Any, Dict, List, Optional, Tuple
from .table_creation.AWS_connect import get_rds_client, get_envs

_rds = None
_DB_CLUSTER_ARN = _DB_SECRET_ARN = _DB_NAME = None

def _init():
    global _rds, _DB_CLUSTER_ARN, _DB_SECRET_ARN, _DB_NAME
    if _rds is None:
        _rds = get_rds_client()
        _DB_CLUSTER_ARN, _DB_SECRET_ARN, _DB_NAME = get_envs()

def _exec(sql: str, params: Optional[List[Dict[str, Any]]] = None):
    _init()
    return _rds.execute_statement(
        resourceArn=_DB_CLUSTER_ARN,
        secretArn=_DB_SECRET_ARN,
        database=_DB_NAME,
        sql=sql,
        parameters=params or [],
    )

def _fetch_one_id(res) -> Optional[int]:
    recs = res.get("records") or []
    if not recs:
        return None
    cell = recs[0][0]
    return cell.get("longValue") or int(cell.get("stringValue"))

# ---------------- Clients ----------------

def q_get_or_create_client(first_name: str, last_name: str, dob_iso: str) -> int:
    sel = _exec(
        "SELECT client_id FROM client WHERE client_fn = :fn AND client_ln = :ln AND client_dob = :dob::DATE LIMIT 1;",
        [
            {"name": "fn", "value": {"stringValue": first_name}},
            {"name": "ln", "value": {"stringValue": last_name}},
            {"name": "dob", "value": {"stringValue": dob_iso}},  # YYYY-MM-DD
        ],
    )
    cid = _fetch_one_id(sel)
    if cid:
        return cid

    ins = _exec(
        "INSERT INTO client (client_fn, client_ln, client_dob) VALUES (:fn, :ln, :dob::DATE) RETURNING client_id;",
        [
            {"name": "fn", "value": {"stringValue": first_name}},
            {"name": "ln", "value": {"stringValue": last_name}},
            {"name": "dob", "value": {"stringValue": dob_iso}},
        ],
    )
    return _fetch_one_id(ins)

# ---------------- Triage header ----------------

def q_start_triage(agent_id: int, client_id: int, timestamp: Optional[str] = None) -> int:
    # If timestamp provided from frontend, use it; otherwise use server time
    if timestamp:
        res = _exec(
            """
            INSERT INTO triage (agent_id, client_id, date_time, sent_to_epic)
            VALUES (:aid, :cid, :ts::TIMESTAMP, FALSE)
            RETURNING triage_id;
            """,
            [
                {"name": "aid", "value": {"longValue": int(agent_id)}},
                {"name": "cid", "value": {"longValue": int(client_id)}},
                {"name": "ts", "value": {"stringValue": timestamp}},
            ],
        )
    else:
        res = _exec(
            """
            INSERT INTO triage (agent_id, client_id, date_time, sent_to_epic)
            VALUES (:aid, :cid, NOW(), FALSE)
            RETURNING triage_id;
            """,
            [
                {"name": "aid", "value": {"longValue": int(agent_id)}},
                {"name": "cid", "value": {"longValue": int(client_id)}},
            ],
        )
    return _fetch_one_id(res)

# ---------------- Q/A log ----------------

def q_insert_triage_question(triage_id: int, question: str, answer: str) -> None:
    _exec(
        """
        INSERT INTO triage_question (triage_id, triage_question, triage_answer)
        VALUES (:tid, :q, :a);
        """,
        [
            {"name": "tid", "value": {"longValue": triage_id}},
            {"name": "q", "value": {"stringValue": question[:256]}},
            {"name": "a", "value": {"stringValue": answer[:1024]}},
        ],
    )

# ---------------- Doctors ----------------

def _parse_doctor_name(name: str) -> Tuple[str, str]:
    s = (name or "").replace("Dr.", "").strip()
    if not s:
        return ("", "")
    parts = s.split()
    if len(parts) == 1:
        return ("", parts[0])
    return (" ".join(parts[:-1]), parts[-1])

def q_get_or_create_doctor_by_name(full_name: str) -> Optional[int]:
    fn, ln = _parse_doctor_name(full_name)
    if not ln:
        return None
    sel = _exec(
        "SELECT doc_id FROM doctor WHERE doc_fn = :fn AND doc_ln = :ln LIMIT 1;",
        [
            {"name": "fn", "value": {"stringValue": fn}},
            {"name": "ln", "value": {"stringValue": ln}},
        ],
    )
    did = _fetch_one_id(sel)
    if did:
        return did
    ins = _exec(
        "INSERT INTO doctor (doc_fn, doc_ln) VALUES (:fn, :ln) RETURNING doc_id;",
        [
            {"name": "fn", "value": {"stringValue": fn}},
            {"name": "ln", "value": {"stringValue": ln}},
        ],
    )
    return _fetch_one_id(ins)

def q_doctor_names_by_ids(ids: List[int]) -> List[str]:
    out: List[str] = []
    for did in ids:
        if not did:
            out.append("")
            continue
        res = _exec(
            "SELECT doc_fn, doc_ln FROM doctor WHERE doc_id = :id;",
            [{"name": "id", "value": {"longValue": did}}],
        )
        recs = res.get("records") or []
        if not recs:
            out.append("")
            continue
        fn = recs[0][0].get("stringValue") or ""
        ln = recs[0][1].get("stringValue") or ""
        nm = f"{fn} {ln}".strip()
        out.append(nm)
    return out

# ---------------- Update triage from inference ----------------

def _coerce_percent(x: Any) -> int:
    try:
        v = float(x)
    except Exception:
        return 0
    if 0.0 <= v <= 1.0:
        v *= 100.0
    return int(round(v))

def _subs_to_conf_columns(subs: List[Dict[str, Any]]) -> Dict[str, int]:
    cols = dict(re_conf=0, mfm_conf=0, uro_conf=0, gob_conf=0, mis_conf=0, go_conf=0)
    for s in subs or []:
        short = (s.get("subspecialty_short") or "").lower()
        name = (s.get("subspecialty_name") or "").lower()
        p = _coerce_percent(s.get("percent_match", 0))
        
        # Match based on short code first, then name
        if "rei" in short or "reproductive" in name or "infertility" in name:
            cols["re_conf"] = p
        elif "mfm" in short or "maternal" in name or "fetal" in name:
            cols["mfm_conf"] = p
        elif "urogyn" in short or "uro" in short or "urogynecolog" in name or "reconstructive" in name:
            cols["uro_conf"] = p
        elif "ob/gyn" in short or "ob/gyn" in name or "general ob" in name:
            cols["gob_conf"] = p
        elif "mis" in short or "minimally invasive" in name:
            cols["mis_conf"] = p
        elif "gynonc" in short or "go" == short or "oncolog" in name:
            cols["go_conf"] = p
    
    return cols

def q_update_triage_from_inference(
    triage_id: int,
    subs: List[Dict[str, Any]],
    conds: List[Dict[str, Any]],
    docs: List[Dict[str, Any]] | Dict[str, Any],
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Persist: subspecialist confidences + top 3 doctors.
    Return normalized triplet (subs, conds, docs_list) for API response.
    """
    # normalize doctors to list of {rank, name}
    doc_list: List[Dict[str, Any]]
    if isinstance(docs, dict):
        ordered = [docs.get("top1"), docs.get("top2"), docs.get("top3")]
        doc_list = [{"rank": i + 1, "name": n} for i, n in enumerate(ordered) if n]
    else:
        doc_list = [{"rank": int(d.get("rank", i + 1)), "name": d.get("name", "")}
                    for i, d in enumerate(docs or [])]

    # map names -> IDs (create if missing)
    doc_ids: List[Optional[int]] = []
    for d in doc_list[:3]:
        doc_ids.append(q_get_or_create_doctor_by_name(d.get("name", "")) or None)
    doc1 = doc_ids[0] if len(doc_ids) > 0 else None
    doc2 = doc_ids[1] if len(doc_ids) > 1 else None
    doc3 = doc_ids[2] if len(doc_ids) > 2 else None

    # subspecialist confidences -> columns
    conf = _subs_to_conf_columns(subs or [])

    set_parts = []
    params: List[Dict[str, Any]] = [{"name": "tid", "value": {"longValue": triage_id}}]

    for col, val in conf.items():
        set_parts.append(f"{col} = :{col}")
        params.append({"name": col, "value": {"longValue": int(val)}})

    if doc1 is not None:
        set_parts.append("doc_id1 = :d1")
        params.append({"name": "d1", "value": {"longValue": int(doc1)}})
    if doc2 is not None:
        set_parts.append("doc_id2 = :d2")
        params.append({"name": "d2", "value": {"longValue": int(doc2)}})
    if doc3 is not None:
        set_parts.append("doc_id3 = :d3")
        params.append({"name": "d3", "value": {"longValue": int(doc3)}})

    if set_parts:
        _exec(f"UPDATE triage SET {', '.join(set_parts)} WHERE triage_id = :tid;", params)

    return subs or [], conds or [], doc_list

# ---------------- End triage ----------------

def q_end_triage(triage_id: int, agent_notes: Optional[str]) -> None:
    _exec(
        "UPDATE triage SET agent_notes = :n WHERE triage_id = :tid;",
        [
            {"name": "n", "value": {"stringValue": (agent_notes or "")[:65535]}},
            {"name": "tid", "value": {"longValue": triage_id}},
        ],
    )
