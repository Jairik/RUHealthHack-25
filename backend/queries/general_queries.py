import os
from dateutil import parser
import boto3
from .table_creation.AWS_connect import get_rds_client, get_envs
from .utils.convert_date_overkill import parse_date_all 
from datetime import date as Date  # For typing consistency
from typing import Optional, Tuple, Dict, Any

# Get RDS Data API client
rds_client = get_rds_client()
DB_CLUSTER_ARN, DB_SECRET_ARN, DB_NAME = get_envs()

def run_query(sql, params=None):
    """Execute a SQL statement via Data API."""

    return rds_client.execute_statement(
        resourceArn=DB_CLUSTER_ARN,
        secretArn=DB_SECRET_ARN,
        database=DB_NAME,
        sql=sql,
        parameters=params or []
    )
    
# Basic example function to fetch all clients from triage
def fetchAllClients():
    sql = "SELECT * FROM triage;"
    response = run_query(sql)
    return response.get('records', [])

def addMedHistory(first_name: str, last_name: str, dob: Date, new_text: str):
    """
    Append `new_text` to client_history.history for the client identified by (fn, ln, dob).
    `dob_iso` must be 'YYYY-MM-DD', however will try best to convert it.
    """
    # Try best attempt to convert string to ISO format
    dob_iso = parse_date_all(dob, prefer="US")["best"]
    if not dob_iso:
        return {"success": False, "error": "Could not parse date of birth."}
    
    # Define the SQL query with parameter placeholders
    sql = """
    INSERT INTO client_history (client_id, history)
    SELECT c.client_id, :new_text
    FROM client c
    WHERE c.client_fn = :fn
      AND c.client_ln = :ln
      AND c.client_dob = :dob::date
    ON CONFLICT (client_id)
    DO UPDATE SET history =
        COALESCE(client_history.history || E'\\n', '') || EXCLUDED.history;
    """
    # Define parameters
    params = [
        {"name": "fn",        "value": {"stringValue": first_name}},
        {"name": "ln",        "value": {"stringValue": last_name}},
        # Data API: pass as string + cast to ::date in SQL (most reliable)
        {"name": "dob",       "value": {"stringValue": dob_iso}},
        {"name": "new_text",  "value": {"stringValue": new_text}},
    ]

    resp = rds_client.execute_statement(
        resourceArn=DB_CLUSTER_ARN,
        secretArn=DB_SECRET_ARN,
        database=DB_NAME,
        sql=sql,
        parameters=params,
    )

    # numberOfRecordsUpdated counts 1 for INSERT or UPDATE paths
    updated = resp.get("numberOfRecordsUpdated", 0)

    # If 0, the SELECT in the INSERT matched no client rows (name/dob not found)
    return {"success": updated > 0, "rows_affected": updated}

def validateClientExists(firstName: str, lastName: str, dob: Date):
    ''' Check if a patient exists in the DB for further logic checks '''
    sql = """
    SELECT COUNT(*) FROM client
    WHERE client_fn = :firstName AND client_ln = :lastName AND client_dob = :dob;
    """
    params = [
        {'name': 'firstName', 'value': {'stringValue': firstName}},
        {'name': 'lastName', 'value': {'stringValue': lastName}},
        {'name': 'dob', 'value': {'stringValue': dob.isoformat()}}
    ]
    response = run_query(sql, params)
    count = int(response['records'][0][0]['longValue'])
    return count > 0

def addUserInfo(firstName: str, lastName: str, dob: Date, insPolId: int):
    ''' Add a new patient to the DB '''
    sql = """
    INSERT INTO client (client_fn, client_ln, client_dob, ins_pol_id)
    VALUES (:firstName, :lastName, :dob, :insPolId);
    """
    params = [
        {'name': 'firstName', 'value': {'stringValue': firstName}},
        {'name': 'lastName', 'value': {'stringValue': lastName}},
        {'name': 'dob', 'value': {'stringValue': dob.isoformat()}},
        {'name': 'insPolId', 'value': {'longValue': insPolId}}
    ]
    run_query(sql, params)
    return {"success": True}

def getPatientHistory(firstName: str, lastName: str, dob: Date):
    ''' Retrieve the medical history text for a patient identified by (fn, ln, dob). '''
    # Normalize date to ISO format
    try:
        parsed = parse_date_all(dob_input, context="dob", prefer="US")
        dob_iso = parsed.get("best")
        if not dob_iso:
            return f"Invalid or ambiguous DOB: {dob_input}"
    except Exception as e:
        return f"Failed to parse DOB: {e}"

    # Query for the history text
    sql = """
    SELECT ch.history
    FROM client c
    LEFT JOIN client_history ch USING (client_id)
    WHERE c.client_fn = :fn
      AND c.client_ln = :ln
      AND c.client_dob = :dob::date;
    """

    params = [
        {"name": "fn",  "value": {"stringValue": firstName}},
        {"name": "ln",  "value": {"stringValue": lastName}},
        {"name": "dob", "value": {"stringValue": dob_iso}},
    ]

    resp = run_query(sql, params)
    records = resp.get("records", [])
    if not records:
        return "No history found."

    # Extract the first record’s history field
    field = records[0][0]
    if "stringValue" in field:
        return field["stringValue"]
    elif "isNull" in field and field["isNull"]:
        return "No history recorded."
    else:
        return str(field)

def _exec_sql(sql: str) -> Dict[str, Any]:
    return rds_client.execute_statement(
        resourceArn=DB_CLUSTER_ARN,
        secretArn=DB_SECRET_ARN,
        database=DB_NAME,
        sql=sql,
    )

def _exec_sql_params(sql: str, params: list) -> Dict[str, Any]:
    return rds_client.execute_statement(
        resourceArn=DB_CLUSTER_ARN,
        secretArn=DB_SECRET_ARN,
        database=DB_NAME,
        sql=sql,
        parameters=params,
    )

def _cell(cell: Dict[str, Any]) -> Any:
    for k in ("longValue", "stringValue", "doubleValue", "booleanValue"):
        if k in cell:
            return cell[k]
    if cell.get("isNull"):
        return None
    return None

def _first_value(resp: Dict[str, Any]) -> Optional[Any]:
    recs = resp.get("records") or []
    if recs and recs[0]:
        return _cell(recs[0][0])
    return None

def _returning_id(resp: Dict[str, Any]) -> Optional[int]:
    gf = resp.get("generatedFields")
    if isinstance(gf, list) and gf:
        v = _cell(gf[0])
        return int(v) if v is not None else None
    v = _first_value(resp)
    try:
        return int(v) if v is not None else None
    except (TypeError, ValueError):
        return None

# ---------- Client creation / lookup ----------
def q_get_or_create_client(client_fn: str, client_ln: str, client_dob: str) -> int:
    existing = _exec_sql_params(
        """
        SELECT client_id FROM client
        WHERE client_fn = :fn AND client_ln = :ln AND client_dob = :dob
        ORDER BY client_id DESC LIMIT 1;
        """,
        [
            {"name": "fn", "value": {"stringValue": client_fn}},
            {"name": "ln", "value": {"stringValue": client_ln}},
            {"name": "dob", "value": {"stringValue": client_dob}},
        ],
    )
    cid = _first_value(existing)
    if cid:
        return int(cid)

    ins = None  # ins_pol_id nullable
    created = _exec_sql_params(
        """
        INSERT INTO client (client_fn, client_ln, client_dob, ins_pol_id)
        VALUES (:fn, :ln, :dob, :ins) RETURNING client_id;
        """,
        [
            {"name": "fn", "value": {"stringValue": client_fn}},
            {"name": "ln", "value": {"stringValue": client_ln}},
            {"name": "dob", "value": {"stringValue": client_dob}},
            {"name": "ins", "value": {"isNull": True}} if ins is None else {"name": "ins", "value": {"longValue": ins}},
        ],
    )
    cid2 = _returning_id(created)
    if not cid2:
        raise RuntimeError("Could not obtain client_id")
    return cid2

# ---------- Start triage ----------
def q_start_triage(agent_id: int, client_id: int) -> int:
    resp = _exec_sql_params(
        """
        INSERT INTO triage (agent_id, client_id)
        VALUES (:agent, :client)
        RETURNING triage_id;
        """,
        [
            {"name": "agent", "value": {"longValue": agent_id}},
            {"name": "client", "value": {"longValue": client_id}},
        ],
    )
    tid = _returning_id(resp)
    if not tid:
        raise RuntimeError("Could not obtain triage_id")
    return tid

# ---------- Record Q/A ----------
def q_insert_triage_question(triage_id: int, question: str, answer: str) -> None:
    _exec_sql_params(
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

# ---------- Doctor helpers ----------
def _get_or_create_doctor(doc_fullname: str) -> Optional[int]:
    name = doc_fullname.strip()
    if not name:
        return None
    parts = name.split()
    fn = parts[0]
    ln = " ".join(parts[1:]) if len(parts) > 1 else ""
    found = _exec_sql_params(
        """
        SELECT doc_id FROM doctor
        WHERE doc_fn = :fn AND doc_ln = :ln
        ORDER BY doc_id DESC LIMIT 1;
        """,
        [
            {"name": "fn", "value": {"stringValue": fn}},
            {"name": "ln", "value": {"stringValue": ln}},
        ],
    )
    doc_id = _first_value(found)
    if doc_id:
        return int(doc_id)

    created = _exec_sql_params(
        "INSERT INTO doctor (doc_fn, doc_ln) VALUES (:fn, :ln) RETURNING doc_id;",
        [
            {"name": "fn", "value": {"stringValue": fn}},
            {"name": "ln", "value": {"stringValue": ln}},
        ],
    )
    return _returning_id(created)

def _map_subspecialty_to_columns(sub_name: str) -> Optional[str]:
    key = sub_name.lower().strip()
    if "reproductive" in key:         # Reproductive Endocrinology
        return "re_conf"
    if "maternal-fetal" in key or "maternal fetal" in key or "mfm" in key:
        return "mfm_conf"
    if "uro" in key:                  # Urogynecology
        return "uro_conf"
    if "general" in key or "ob/gyn" in key or "obgyn" in key:
        return "gob_conf"
    if "minimally invasive" in key or "mis" in key:
        return "mis_conf"
    if "oncology" in key or key == "go":
        return "go_conf"
    return None

# ---------- Update triage from model inference ----------
def q_update_triage_from_inference(
    triage_id: int,
    subspecialty_results: list,  # list of {subspecialty_name, percent_match}
    doctor_results: list         # list of {"rank": "...", "name": "..."}
) -> None:
    set_parts = []
    params = [{"name": "tid", "value": {"longValue": triage_id}}]

    for item in subspecialty_results or []:
        col = _map_subspecialty_to_columns(str(item.get("subspecialty_name", "")))
        try:
            pct = int(float(item.get("percent_match", 0)))
        except Exception:
            pct = 0
        if col:
            set_parts.append(f"{col} = :{col}")
            params.append({"name": col, "value": {"longValue": pct}})

    doc_ids: Tuple[Optional[int], Optional[int], Optional[int]] = (None, None, None)
    if doctor_results:
        names = [d.get("name") for d in doctor_results][:3]
        ids = [_get_or_create_doctor(n) for n in names]
        doc_ids = tuple((ids + [None, None, None])[:3])

    for idx, col in enumerate(["doc_id1", "doc_id2", "doc_id3"], start=0):
        if doc_ids[idx]:
            set_parts.append(f"{col} = :{col}")
            params.append({"name": col, "value": {"longValue": int(doc_ids[idx])}})

    if not set_parts:
        return

    sql = f"UPDATE triage SET {', '.join(set_parts)} WHERE triage_id = :tid;"
    _exec_sql_params(sql, params)

# ---------- End triage ----------
def q_end_triage(triage_id: int, agent_notes: Optional[str]) -> None:
    _exec_sql_params(
        "UPDATE triage SET agent_notes = :n WHERE triage_id = :tid;",
        [
            {"name": "n", "value": {"stringValue": (agent_notes or "")[:65535]}},
            {"name": "tid", "value": {"longValue": triage_id}},
        ],
    )
