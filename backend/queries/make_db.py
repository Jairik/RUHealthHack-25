"""
Creates a simple 'users' table in Aurora Serverless v2 using the AWS RDS Data API.

Before running:
    
Ensure AWS CLI credentials are configured (aws configure)
Replace placeholders below (or export as env vars)
Aurora cluster must have the Data API enabled
"""

import boto3
import json
import os

#Pulling variables fron .env file
DB_CLUSTER_ARN = os.getenv("DB_CLUSTER_ARN", "arn:aws:rds:us-east-1:533267217230:cluster:tf-XXXXXXXXXXXXXXX")
DB_SECRET_ARN = os.getenv("DB_SECRET_ARN", "arn:aws:secretsmanager:us-east-1:533267217230㊙️dev/db-credentials-lVHRG7")
DB_NAME = os.getenv("DB_NAME", "appdb")

#Create the boto3 client for the Data API
rds_data = boto3.client("rds-data", region_name="us-east-1")

#Helper function to execute SQL
def execute_sql(sql: str):
    """Executes a SQL statement via RDS Data API."""
    print(f"Running SQL:\n{sql}\n{'-'*50}")
    response = rds_data.execute_statement(
        resourceArn=DB_CLUSTER_ARN,
        secretArn=DB_SECRET_ARN,
        database=DB_NAME,
        sql=sql,
    )
    return response

# Create a sample table
create_table_sql: str = """
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

try:
    execute_sql(create_table_sql)
    print("✅ Table 'users' created or already exists.")
except Exception as e:
    print("❌ Failed to create table:", e)

#Verifying table creation
try:
    result = execute_sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    print("Tables in DB:")
    for record in result.get("records", []):
        print(" -", record[0]["stringValue"])
except Exception as e:
    print("❌ Failed to verify tables:", e)