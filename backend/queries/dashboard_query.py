from typing import List, Optional, Tuple, Dict, Any
from backend.db import get_connection

TZ = 'America/New_York'
SPECIALTY_COLS = [
    ("Minimally Invasive Surgery", "mis_conf"),
    ("General OB/GYN", "gob_conf"),
    ("Reproductive Endocrinology", "re_conf"),
    ("Urogynecology", "uro_conf"),
    ("Gynecologic Oncology", "go_conf"),
    ("Maternal-Fetal Medicine", "mfm_conf")
]

def _execute_scalar(sql: str, params: tuple = ()) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        row = cur.fetchone()
        return row[0] if row else 0
    finally:
        conn.close()

def q_delete_triage(triage_id: int) -> bool:
    conn = get_connection()
    try:
        # Cascade delete manually since foreign keys might not cascade automatically depending on PRAGMA
        conn.execute("DELETE FROM triage_question WHERE triage_id = ?", (triage_id,))
        cur = conn.execute("DELETE FROM triage WHERE triage_id = ?", (triage_id,))
        conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        print(f"Error deleting triage {triage_id}: {e}")
        return False
    finally:
        conn.close()

def _execute_query(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        rows = cur.fetchall()
        # sqlite3.Row objects can be converted to dict
        return [dict(row) for row in rows]
    finally:
        conn.close()

def q_delete_triage(triage_id: int) -> bool:
    conn = get_connection()
    try:
        # Cascade delete manually since foreign keys might not cascade automatically depending on PRAGMA
        conn.execute("DELETE FROM triage_question WHERE triage_id = ?", (triage_id,))
        cur = conn.execute("DELETE FROM triage WHERE triage_id = ?", (triage_id,))
        conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        print(f"Error deleting triage {triage_id}: {e}")
        return False
    finally:
        conn.close()

def q_total_triages() -> int:
    return _execute_scalar("SELECT COUNT(*) FROM triage;")

def q_cases_today(tz: str = TZ) -> int:
    # SQLite 'date("now", "localtime")' is approximate for "server local time".
    # For a hackathon project, using 'now', 'localtime' is usually sufficient.
    # Otherwise we'd need to pass python datetime objects.
    # Let's simple check matching dates in strings.
    sql = """
    SELECT COUNT(*) 
    FROM triage 
    WHERE date(date_time, 'localtime') = date('now', 'localtime');
    """
    return _execute_scalar(sql)

def q_cases_this_week(tz: str = TZ) -> int:
    # 'weekday 0' is Sunday in some systems, Monday in others. SQLite modifier 'weekday 0' advances to next Sunday.
    # We want current week. 
    # date('now', 'localtime', 'weekday 0', '-7 days') gives start of week (Sunday-based).
    sql = """
    SELECT COUNT(*)
    FROM triage
    WHERE date(date_time, 'localtime') >= date('now', 'localtime', 'weekday 0', '-7 days');
    """
    return _execute_scalar(sql)

def q_search_triages(term: Optional[str], page: int = 1, page_size: int = 20) -> Dict[str, Any]:
    term = (term or "").strip()
    offset = (max(page, 1) - 1) * page_size

    where_clauses = []
    params = []

    if term:
        # SQLite uses LIKE not ILIKE, but standard ASCII chars are usually case-insensitive in LIKE by default in SQLite?
        # Actually it's PRAGMA case_sensitive_like=OFF by default.
        where_clauses.append("""
        (
          c.client_fn LIKE ? OR
          c.client_ln LIKE ? OR
          t.agent_id LIKE ? OR
          ('TRG-' || printf('%03d', t.triage_id)) LIKE ?
        )
        """)
        p = f"%{term}%"
        params.extend([p, p, p, p])

    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    # Main query
    sql = f"""
      SELECT
        t.triage_id, t.agent_id, t.client_id, t.date_time,
        t.re_conf, t.mfm_conf, t.uro_conf, t.gob_conf, t.mis_conf, t.go_conf,
        t.doc_id1, t.doc_id2, t.doc_id3,
        t.agent_notes,
        COALESCE(t.sent_to_epic, 0) AS sent_to_epic,
        t.epic_sent_date,
        c.client_fn, c.client_ln, c.client_dob,
        d1.doc_fn AS doc1_fn, d1.doc_ln AS doc1_ln
      FROM triage t
      JOIN client c ON c.client_id = t.client_id
      LEFT JOIN doctor d1 ON d1.doc_id = t.doc_id1
      {where_sql}
      ORDER BY t.triage_id DESC
      LIMIT ? OFFSET ?
    """
    query_params = tuple(params + [page_size, offset])
    
    rows = _execute_query(sql, query_params)

    items = []
    for r in rows:
        case_number = f"TRG-{str(r['triage_id']).zfill(3)}"
        rec_doc = None
        if r.get("doc1_fn") or r.get("doc1_ln"):
            rec_doc = f"Dr. {r.get('doc1_fn','').strip()} {r.get('doc1_ln','').strip()}".strip()

        spec_vals = []
        for label, col in SPECIALTY_COLS:
            v = r.get(col)
            try:
                v = int(v) if v is not None else 0
            except:
                v = 0
            spec_vals.append({"name": label, "confidence": v})
        best = max(spec_vals, key=lambda s: s["confidence"]) if spec_vals else {"name": None, "confidence": 0}

        items.append({
            "id": str(r["triage_id"]),
            "case_number": case_number,
            "agent_id": r["agent_id"],
            "patient_first_name": r.get("client_fn"),
            "patient_last_name": r.get("client_ln"),
            "patient_dob": str(r["client_dob"]) if r.get("client_dob") else None,
            "created_date": str(r["date_time"]),
            "health_history": [],
            "conversation_history": [],
            "final_recommendation": best["name"],
            "confidence_score": best["confidence"],
            "recommended_doctor": rec_doc,
            "subspecialist_confidences": spec_vals,
            "status": "completed",
            "agent_notes": r.get("agent_notes"),
            "sent_to_epic": bool(r.get("sent_to_epic", 0)),
            "epic_sent_date": str(r["epic_sent_date"]) if r.get("epic_sent_date") else None
        })

    # Count totals
    count_sql = f"""
      SELECT COUNT(*)
      FROM triage t
      JOIN client c ON c.client_id = t.client_id
      {where_sql};
    """
    count_params = tuple(params)
    total = _execute_scalar(count_sql, count_params)

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size
    }

def q_mark_sent_to_epic(triage_id: int):
    sql = """
    UPDATE triage
    SET sent_to_epic = 1, epic_sent_date = CURRENT_TIMESTAMP
    WHERE triage_id = ?
    RETURNING triage_id, sent_to_epic, epic_sent_date;
    """
    # SQLite returns cursor from execute.
    conn = get_connection()
    try:
        cur = conn.execute(sql, (triage_id,))
        conn.commit()
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()