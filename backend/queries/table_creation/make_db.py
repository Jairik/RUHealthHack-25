"""
Creates your database tables in Aurora Serverless v2 using the AWS RDS Data API.

Requirements:
- AWS CLI credentials configured (aws configure)
- Aurora cluster with Data API enabled
"""

import boto3
from AWS_connect import get_rds_client, get_envs

# Get RDS Data API client
rds_data = get_rds_client()
DB_CLUSTER_ARN, DB_SECRET_ARN, DB_NAME = get_envs()
print("RDS client:", rds_data)

# Helper function to execute SQL
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

# List of table creation SQL statements
tables_sql = [
    # INSURANCE table first (needed by client)
    """
    CREATE TABLE IF NOT EXISTS insurance (
        ins_id SERIAL PRIMARY KEY,
        ins_pol VARCHAR(50) NOT NULL
    );
    """,

    # CLIENT table
    """
    CREATE TABLE IF NOT EXISTS client (
        client_id SERIAL PRIMARY KEY,
        client_fn VARCHAR(50),
        client_ln VARCHAR(50),
        client_dob DATE,
        ins_pol_id INT,
        FOREIGN KEY (ins_pol_id) REFERENCES insurance(ins_id)
    );
    """,

    # DOCTOR table
    """
    CREATE TABLE IF NOT EXISTS doctor (
        doctor_id SERIAL PRIMARY KEY,
        doctor_fn VARCHAR(50),
        doctor_ln VARCHAR(50)
    );
    """,

    # DOCTOR_INSURANCE table (many-to-many)
    """
    CREATE TABLE IF NOT EXISTS doctor_insurance (
        doctor_id INT NOT NULL,
        ins_id INT NOT NULL,
        PRIMARY KEY (doctor_id, ins_id),
        FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
        FOREIGN KEY (ins_id) REFERENCES insurance(ins_id)
    );
    """,

    # TRIAGE table
    """
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
    """,

    # TRIAGE_QUESTION table
    """
    CREATE TABLE IF NOT EXISTS triage_question (
        triage_question_id SERIAL PRIMARY KEY,
        triage_id INT NOT NULL,
        question VARCHAR(256),
        answer VARCHAR(1024),
        FOREIGN KEY(triage_id) REFERENCES triage(triage_id) ON DELETE CASCADE
    );
    """
]

# Execute all table creation SQLs
for sql in tables_sql:
    try:
        execute_sql(sql)
        print("Table created or already exists.")
    except Exception as e:
        print("Failed to create table:", e)

# Verify tables exist
try:
    result = execute_sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    print("\nTables in DB:")
    for record in result.get("records", []):
        print(" -", record[0]["stringValue"])
except Exception as e:
    print("Failed to verify tables:", e)
