import sqlite3
import os

DB_PATH = "lunara.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    
    # insurance
    c.execute("""
    CREATE TABLE IF NOT EXISTS insurance (
        ins_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ins_pol VARCHAR(50) NOT NULL
    );
    """)

    # doctor
    c.execute("""
    CREATE TABLE IF NOT EXISTS doctor (
        doc_id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_fn VARCHAR(50),
        doc_ln VARCHAR(50)
    );
    """)

    # client
    c.execute("""
    CREATE TABLE IF NOT EXISTS client (
        client_id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_fn VARCHAR(50),
        client_ln VARCHAR(50),
        client_dob DATE,
        ins_pol_id INT,
        FOREIGN KEY (ins_pol_id) REFERENCES insurance(ins_id)
    );
    """)

    # doctor_insurance
    c.execute("""
    CREATE TABLE IF NOT EXISTS doctor_insurance (
        doc_id INT NOT NULL REFERENCES doctor(doc_id),
        ins_id INT NOT NULL REFERENCES insurance(ins_id),
        PRIMARY KEY (doc_id, ins_id)
    );
    """)

    # triage
    c.execute("""
    CREATE TABLE IF NOT EXISTS triage (
        triage_id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        sent_to_epic BOOLEAN DEFAULT 0,
        epic_sent_date TIMESTAMP
    );
    """)

    # triage_question
    c.execute("""
    CREATE TABLE IF NOT EXISTS triage_question (
        triage_question_id INTEGER PRIMARY KEY AUTOINCREMENT,
        triage_id INT NOT NULL REFERENCES triage(triage_id),
        triage_question VARCHAR(256),
        triage_answer VARCHAR(1024)
    );
    """)

    conn.commit()
    conn.close()
