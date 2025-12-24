# backend/queries/general_queries.py
import json
from typing import Any, Dict, List, Optional, Tuple
from backend.db import get_connection

# ---------------- Helpers ----------------

def _exec_fetchone(sql: str, params: tuple = ()) -> Optional[Any]:
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        row = cur.fetchone()
        return row
    finally:
        conn.close()

def _exec_fetchall(sql: str, params: tuple = ()) -> List[Any]:
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        rows = cur.fetchall()
        return rows
    finally:
        conn.close()

def _exec_insert(sql: str, params: tuple = ()) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()

def _exec_autocommit(sql: str, params: tuple = ()) -> None:
    conn = get_connection()
    try:
        conn.execute(sql, params)
        conn.commit()
    finally:
        conn.close()

# ---------------- Clients ----------------

def q_get_or_create_client(first_name: str, last_name: str, dob_iso: str) -> int:
    row = _exec_fetchone(
        "SELECT client_id FROM client WHERE client_fn = ? AND client_ln = ? AND client_dob = ? LIMIT 1;",
        (first_name, last_name, dob_iso)
    )
    if row:
        return row['client_id']

    return _exec_insert(
        "INSERT INTO client (client_fn, client_ln, client_dob) VALUES (?, ?, ?);",
        (first_name, last_name, dob_iso)
    )

# ---------------- Triage header ----------------

def q_start_triage(agent_id: int, client_id: int, timestamp: Optional[str] = None) -> int:
    # If timestamp provided from frontend, use it; otherwise use server time (CURRENT_TIMESTAMP in default)
    if timestamp:
        return _exec_insert(
            """
            INSERT INTO triage (agent_id, client_id, date_time, sent_to_epic)
            VALUES (?, ?, ?, 0);
            """,
            (int(agent_id), int(client_id), timestamp)
        )
    else:
        return _exec_insert(
            """
            INSERT INTO triage (agent_id, client_id, sent_to_epic)
            VALUES (?, ?, 0);
            """,
            (int(agent_id), int(client_id))
        )

# ---------------- Q/A log ----------------

def q_insert_triage_question(triage_id: int, question: str, answer: str) -> None:
    _exec_autocommit(
        """
        INSERT INTO triage_question (triage_id, triage_question, triage_answer)
        VALUES (?, ?, ?);
        """,
        (triage_id, question[:256], answer[:1024])
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
    row = _exec_fetchone(
        "SELECT doc_id FROM doctor WHERE doc_fn = ? AND doc_ln = ? LIMIT 1;",
        (fn, ln)
    )
    if row:
        return row['doc_id']

    return _exec_insert(
        "INSERT INTO doctor (doc_fn, doc_ln) VALUES (?, ?);",
        (fn, ln)
    )

def q_doctor_names_by_ids(ids: List[int]) -> List[str]:
    out: List[str] = []
    for did in ids:
        if not did:
            out.append("")
            continue
        row = _exec_fetchone(
            "SELECT doc_fn, doc_ln FROM doctor WHERE doc_id = ?;",
            (did,)
        )
        if not row:
            out.append("")
            continue
        fn = row['doc_fn'] or ""
        ln = row['doc_ln'] or ""
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

    # Build update statement dynamically
    set_parts = []
    params = []
    
    for col, val in conf.items():
        set_parts.append(f"{col} = ?")
        params.append(int(val))

    if doc1 is not None:
        set_parts.append("doc_id1 = ?")
        params.append(int(doc1))
    if doc2 is not None:
        set_parts.append("doc_id2 = ?")
        params.append(int(doc2))
    if doc3 is not None:
        set_parts.append("doc_id3 = ?")
        params.append(int(doc3))

    if set_parts:
        params.append(triage_id)
        _exec_autocommit(f"UPDATE triage SET {', '.join(set_parts)} WHERE triage_id = ?;", tuple(params))

    return subs or [], conds or [], doc_list

# ---------------- End triage ----------------

def q_end_triage(triage_id: int, agent_notes: Optional[str]) -> None:
    _exec_autocommit(
        "UPDATE triage SET agent_notes = ? WHERE triage_id = ?;",
        ((agent_notes or "")[:65535], triage_id)
    )
