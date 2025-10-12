import boto3
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
    ''' Retrieve patient history from the DB '''
    sql = """
    SELECT * FROM client
    WHERE client_fn = :firstName AND client_ln = :lastName AND client_dob = :dob;
    """
    params = [
        {'name': 'firstName', 'value': {'stringValue': firstName}},
        {'name': 'lastName', 'value': {'stringValue': lastName}},
        {'name': 'dob', 'value': {'stringValue': dob.isoformat()}}
    ]
    response = run_query(sql, params)
    records = response.get('records', [])
    
    # Validate that records were found
    if not records:
        return "No history found."
    
    # Format the records into a readable string
    history = []
    for record in records:
        formatted_record = ". ".join(f"{key}: {value.get(list(value.keys())[0])}" for key, value in zip(['client_id', 'client_fn', 'client_ln', 'client_dob', 'ins_pol_id'], record))
        history.append(formatted_record)
    
    return "\n".join(history)