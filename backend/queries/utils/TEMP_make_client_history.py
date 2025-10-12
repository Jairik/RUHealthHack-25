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

create_client_history_table_sql: str = """
CREATE TABLE IF NOT EXISTS client_history (
    client_id INT PRIMARY KEY REFERENCES client(client_id) ON DELETE CASCADE,
    history TEXT NOT NULL DEFAULT ''
);
"""

run_query(create_client_history_table_sql)