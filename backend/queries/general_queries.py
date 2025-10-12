import os
from dateutil import parser
import boto3
from table_creation.AWS_connect import get_rds_client, get_envs
from utils.convert_date_overkill import parse_date_all 

# Get RDS Data API client
rds_client = get_rds_client()
DB_CLUSTER_ARN, DB_SECRET_ARN, DB_NAME = get_envs()
print("RDS client:", rds_client)  # Validation

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

def addMedHistory(first_name: str, last_name: str, dob: DATE, first_response: str):
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

    resp = rds.execute_statement(
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

# TODO TODO TODO - FIX ONCE DB IS UPDATED - TODO TODO TODO
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