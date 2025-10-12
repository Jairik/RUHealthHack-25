# seed_triage.py
import os, re, sys, boto3
from botocore.exceptions import ClientError

# Optional .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

REQUIRED_VARS = ["DB_CLUSTER_ARN", "DB_SECRET_ARN", "AWS_REGION"]
for k in REQUIRED_VARS:
    if not os.getenv(k):
        print(f"Missing env var: {k}")
        print("Set DB_CLUSTER_ARN, DB_SECRET_ARN, AWS_REGION (and optionally DB_NAME).")
        sys.exit(2)

RESOURCE_ARN = os.getenv("DB_CLUSTER_ARN")
SECRET_ARN   = os.getenv("DB_SECRET_ARN")
REGION       = os.getenv("AWS_REGION", "us-east-1")
DATABASE     = os.getenv("DB_NAME", "postgres")

client = boto3.client("rds-data", region_name=REGION)

CREATE_TRIAGE = """
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
""".strip()

# Paste your SQL (create + many inserts) below, or read from a .sql file via sys.stdin
SQL_BLOB = r"""
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

INSERT INTO triage (agent_id, client_id, date_time, re_conf, mfm_conf, uro_conf, gob_conf, mis_conf, go_conf, doc_id1, doc_id2, doc_id3, agent_notes, sent_to_epic, epic_sent_date) VALUES (101, 1881, '2025-10-12 00:28:50', 23, 54, 8, 1, 5, 9, 13, 18, 12, 'HIST: hx of PCOS in 2011; family hx of endometrial cancer | CURR: concern for nausea in pregnancy after exercise; denies foul discharge, but endorses pelvic pain weekly | Q/A steps: 3', FALSE, NULL);
INSERT INTO triage (agent_id, client_id, date_time, re_conf, mfm_conf, uro_conf, gob_conf, mis_conf, go_conf, doc_id1, doc_id2, doc_id3, agent_notes, sent_to_epic, epic_sent_date) VALUES (103, 2311, '2025-10-12 00:28:50', 3, 23, 49, 4, 19, 2, 14, 19, 9, 'HIST: family hx of endometrial cancer; hx of fibroids in 2015 | CURR: concern for vaginal bulge after exercise; notes nausea in pregnancy that improves with NSAIDs | Q/A steps: 3', FALSE, NULL);
-- (… keep the rest of your INSERTs exactly as you provided …)
""".strip()

# --- Helpers ---
def execute_sql(sql: str):
    return client.execute_statement(
        resourceArn=RESOURCE_ARN,
        secretArn=SECRET_ARN,
        database=DATABASE,
        sql=sql,
    )

def create_table():
    try:
        execute_sql(CREATE_TRIAGE)
        print("triage table ensured (IF NOT EXISTS).")
    except ClientError as e:
        print("Failed to create triage table:", e)
        sys.exit(1)

# Extract INSERT rows from SQL_BLOB
INSERT_RE = re.compile(
    r"INSERT\s+INTO\s+triage\s*\((.*?)\)\s*VALUES\s*\((.*?)\)\s*;",
    re.IGNORECASE | re.DOTALL
)

def parse_bool(tok: str) -> str:
    t = tok.strip().upper()
    return "TRUE" if t in ("TRUE", "T", "1") else "FALSE"

def parse_values_list(vals_str: str):
    """
    Very simple parser tailored to your VALUES() layout.
    Splits at commas, respecting single quotes.
    """
    vals = []
    cur = []
    inq = False
    esc = False
    for ch in vals_str:
        if esc:
            cur.append(ch); esc = False; continue
        if ch == "\\":
            cur.append(ch); esc = True; continue
        if ch == "'":
            inq = not inq
            cur.append(ch); continue
        if ch == "," and not inq:
            vals.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    if cur:
        vals.append("".join(cur).strip())
    return vals

def normalize_row(vals):
    """
    vals are strings corresponding to:
    [0]=agent_id, [1]=client_id, [2]=date_time, [3]=re_conf, [4]=mfm_conf, [5]=uro_conf,
    [6]=gob_conf, [7]=mis_conf, [8]=go_conf, [9]=doc_id1, [10]=doc_id2, [11]=doc_id3,
    [12]=agent_notes, [13]=sent_to_epic, [14]=epic_sent_date
    """
    # convert 0 doctor ids -> NULL (so FK is optional)
    def nz(x):
        tx = x.strip()
        return "NULL" if tx in ("0", "NULL") else tx

    doc1 = nz(vals[9])
    doc2 = nz(vals[10])
    doc3 = nz(vals[11])

    # ensure booleans are TRUE/FALSE
    sent = parse_bool(vals[13])

    return {
        "agent_id": vals[0],
        "client_id": vals[1],
        "date_time": vals[2],
        "re_conf": vals[3],
        "mfm_conf": vals[4],
        "uro_conf": vals[5],
        "gob_conf": vals[6],
        "mis_conf": vals[7],
        "go_conf": vals[8],
        "doc_id1": doc1,
        "doc_id2": doc2,
        "doc_id3": doc3,
        "agent_notes": vals[12],
        "sent_to_epic": sent,
        "epic_sent_date": vals[14],
    }

def guarded_insert_sql(row):
    """
    Build an INSERT ... SELECT ... WHERE EXISTS(...) so we only insert when parents exist.
    """
    cols = "(agent_id, client_id, date_time, re_conf, mfm_conf, uro_conf, gob_conf, mis_conf, go_conf, doc_id1, doc_id2, doc_id3, agent_notes, sent_to_epic, epic_sent_date)"
    values_select = f"""
SELECT
  {row['agent_id']}::int,
  {row['client_id']}::int,
  {row['date_time']}::timestamp,
  {row['re_conf']}::int,
  {row['mfm_conf']}::int,
  {row['uro_conf']}::int,
  {row['gob_conf']}::int,
  {row['mis_conf']}::int,
  {row['go_conf']}::int,
  {row['doc_id1']}::int,
  {row['doc_id2']}::int,
  {row['doc_id3']}::int,
  {row['agent_notes']},
  {row['sent_to_epic']},
  {row['epic_sent_date']}
WHERE EXISTS (SELECT 1 FROM client c WHERE c.client_id = {row['client_id']}::int)
  AND ({row['doc_id1']} IS NULL OR EXISTS (SELECT 1 FROM doctor d1 WHERE d1.doc_id = {row['doc_id1']}::int))
  AND ({row['doc_id2']} IS NULL OR EXISTS (SELECT 1 FROM doctor d2 WHERE d2.doc_id = {row['doc_id2']}::int))
  AND ({row['doc_id3']} IS NULL OR EXISTS (SELECT 1 FROM doctor d3 WHERE d3.doc_id = {row['doc_id3']}::int))
"""
    return f"INSERT INTO triage {cols}\n{values_select};"

def main():
    # 1) Ensure triage table exists
    create_table()

    # 2) Build guarded inserts
    inserts = []
    for m in INSERT_RE.finditer(SQL_BLOB):
        values_str = m.group(2)
        vals = parse_values_list(values_str)
        if len(vals) != 15:
            print("Skipping malformed VALUES row:", values_str[:120], "...")
            continue
        row = normalize_row(vals)
        sql = guarded_insert_sql(row)
        inserts.append(sql)

    # 3) Execute all inserts (independently)
    ok = skipped = 0
    for i, sql in enumerate(inserts, 1):
        preview = re.sub(r"\s+", " ", sql)[:140]
        try:
            execute_sql(sql)
            ok += 1
            if i % 10 == 0 or i == len(inserts):
                print(f"[{i}/{len(inserts)}] OK (running)")
        except ClientError as e:
            skipped += 1
            print(f"[{i}/{len(inserts)}] SKIP -> {e.response.get('Error', {}).get('Message', str(e))}")

    print(f"\nDone. Inserted: {ok}, Skipped (parents missing or errors): {skipped}")

if __name__ == "__main__":
    main()
