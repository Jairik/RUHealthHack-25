"""
Creates a simple 'users' table in Aurora Serverless v2 using the AWS RDS Data API.

Before running:
    
Ensure AWS CLI credentials are configured (aws configure)
Replace placeholders below (or export as env vars)
Aurora cluster must have the Data API enabled
"""

import boto3
import json
from dotenv import load_dotenv
import os
from pathlib import Path
from AWS_connect import get_rds_client, get_envs

# Get the client from AWS_connect
rds_data = get_rds_client()
DB_CLUSTER_ARN, DB_SECRET_ARN, DB_NAME = get_envs()
print(rds_data)

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
create_client_table_sql: str = """
    CREATE TABLE IF NOT EXISTS client (
    client_id SERIAL PRIMARY KEY,
    client_fn VARCHAR(50),
    client_ln VARCHAR(50),
    client_dob DATE,
    ins_pol_id INT,
    FOREIGN KEY (ins_pol_id) REFERENCES insurance(ins_id)
    );
"""
create_doctor_table_sql: str = """
    CREATE TABLE IF NOT EXISTS doctor (
    doc_id SERIAL PRIMARY KEY,
    doc_fn VARCHAR(50),
    doc_ln VARCHAR(50)
    );
"""
create_insurance_table_sql: str = """
    CREATE TABLE IF NOT EXISTS insurance (
    ins_id SERIAL PRIMARY KEY,
    ins_pol VARCHAR(50) NOT NULL
    );
"""
create_doctor_insurance_table_sql: str = """
    CREATE TABLE IF NOT EXISTS doctor_insurance (
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (ins_id) REFRENCES insurance(ins_id)
);
"""
create_triage_question_table_sql: str = """
    CREATE TABLE IF NOT EXISTS triage_question (
    triage_answer VARCHAR(1024),
    triage_question VARRCHAR(256),
    FOREIGN KEY(triage_id) REFERENCES triage(triage_id)
    );
"""
create_triage_table_sql: str = """
CREATE TABLE IF NOT EXISTS triage (
    triage_id SERIAL PRIMARY KEY,
    agent_id INT,
    client_id INT NOT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    re_conf INT DEFAULT 0,
    mfm_conf INT DEFAULT 0,
    uro_conf INT DEFAULT 0,
    gob_conf INT DEFAULT 0,
    mis_conf INT DEFAULT 0,
    go_conf INT DEFAULT 0,
    doc_id1 INT,
    doc_id2 INT,
    doc_id3 INT,
    agent_notes TEXT,
    FOREIGN KEY (client_id) REFERENCES client(client_id),
    FOREIGN KEY (doc_id1) REFERENCES doctor(doctor_id),
    FOREIGN KEY (doc_id2) REFERENCES doctor(doctor_id),
    FOREIGN KEY (doc_id3) REFERENCES doctor(doctor_id)
);
"""


try:
    execute_sql(create_table_sql)
    print("Table 'users' created or already exists.")
except Exception as e:
    print("Failed to create table:", e)

#Verifying table creation
try:
    result = execute_sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    print("Tables in DB:")
    for record in result.get("records", []):
        print(" -", record[0]["stringValue"])
except Exception as e:
    print("Failed to verify tables:", e)