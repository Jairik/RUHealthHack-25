"""
This script creates the necessary tables in the RDS database using the RDS Data API.
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

create_insurance_table_sql: str = """
CREATE TABLE IF NOT EXISTS insurance (
    ins_id SERIAL PRIMARY KEY,
    ins_pol VARCHAR(50) NOT NULL
);
"""

create_doctor_table_sql: str = """
CREATE TABLE IF NOT EXISTS doctor (
    doc_id SERIAL PRIMARY KEY,
    doc_fn VARCHAR(50),
    doc_ln VARCHAR(50)
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

create_doctor_insurance_table_sql: str = """
CREATE TABLE IF NOT EXISTS doctor_insurance (
    doc_id INT NOT NULL REFERENCES doctor(doc_id),
    ins_id INT NOT NULL REFERENCES insurance(ins_id),
    PRIMARY KEY (doc_id, ins_id)
);
"""

create_triage_table_sql: str = """
CREATE TABLE IF NOT EXISTS triage (
    triage_id SERIAL PRIMARY KEY,
    agent_id INT,
    client_id INT NOT NULL REFERENCES client(client_id),
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    re_conf INT DEFAULT 0,
    mfm_conf INT DEFAULT 0,
    uro_conf INT DEFAULT 0,
    gob_conf INT DEFAULT 0,
    mis_conf INT DEFAULT 0,
    go_conf INT DEFAULT 0,
    doc_id1 INT REFERENCES doctor(doc_id),
    doc_id2 INT REFERENCES doctor(doc_id),
    doc_id3 INT REFERENCES doctor(doc_id),
    agent_notes TEXT,
    sent_to_epic BOOLEAN DEFAULT FALSE,
    epic_sent_date TIMESTAMP
);
"""

create_triage_question_table_sql: str = """
CREATE TABLE IF NOT EXISTS triage_question (
    triage_question_id SERIAL PRIMARY KEY,
    triage_id INT NOT NULL REFERENCES triage(triage_id),
    triage_question VARCHAR(256),
    triage_answer VARCHAR(1024)
);
"""

ddl_statements = [
    ("insurance", create_insurance_table_sql),
    ("doctor", create_doctor_table_sql),
    ("client", create_client_table_sql),
    ("doctor_insurance", create_doctor_insurance_table_sql),
    ("triage", create_triage_table_sql),
    ("triage_question", create_triage_question_table_sql)
]

for name, sql in ddl_statements:
    try:
        execute_sql(sql)  # <— THIS is what actually creates the table
        print(f"OK: {name} created or already exists.")
    except Exception as e:
        print(f"FAILED creating {name}: {e}")
        raise  # stop if something upstream fails