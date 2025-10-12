import os

import boto3
from table_creation.AWS_connect import get_rds_client, get_envs

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
    
def fetchAllClients():
    sql = "SELECT * FROM triage;"
    response = run_query(sql)
    return response.get('records', [])

r = fetchAllClients()
print("All records:", r)

sql = "INSERT INTO triage (agent_id, client_id, date_time, re_conf, mfm_conf, uro_conf, gob_conf, mis_conf, go_conf, doc_id1, doc_id2, doc_id3, agent_notes, sent_to_epic, epic_sent_date) VALUES (101, 1881, '2025-10-12 00:28:50', 23, 54, 8, 1, 5, 9, 13, 18, 12, 'HIST: hx of PCOS in 2011; family hx of endometrial cancer | CURR: concern for nausea in pregnancy after exercise; denies foul discharge, but endorses pelvic pain weekly | Q/A steps: 3', FALSE, NULL)"
run_query(sql)

def addMedHistory(first_name: str, last_name: str, dob: DATE, first_response: str):
    sql = """
    UPDATE client_history
    SET first_response = CONCAT(first_response, '\n', :new_response)
    WHERE client_id = (
        SELECT client_id FROM client
        WHERE client_fn = :fn AND client_ln = :ln AND client_dob = :dob
    );
    """
    
    params = [
        {"name": "fn", "value": {"stringValue": first_name}},
        {"name": "ln", "value": {"stringValue": last_name}},
        {"date": "dob", "value": {"DATE": dob}},
        {"name": "new_response", "value": {"stringValue": first_response}},
    ]
    
    run_query(addMedHistory)
    
    return {"success": True}

