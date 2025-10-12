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

r = fetchAllClients()
print("All records:", r)