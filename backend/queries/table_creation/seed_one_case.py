"""
Seeds one full triage case using the Aurora PostgreSQL Data API.

Run from repo root (venv active, AWS creds valid):
  python -m backend.queries.table_creation.seed_one_case
"""

from typing import Optional, Any, Dict, List
from .AWS_connect import get_rds_client, get_envs

rds = get_rds_client()
DB_CLUSTER_ARN, DB_SECRET_ARN, DB_NAME = get_envs()

def exec_sql(sql: str) -> Dict[str, Any]:
    return rds.execute_statement(
        resourceArn=DB_CLUSTER_ARN,
        secretArn=DB_SECRET_ARN,
        database=DB_NAME,
        sql=sql,
    )

def _cell_value(cell: Dict[str, Any]) -> Optional[Any]:
    # Data API cells are typed: longValue, stringValue, doubleValue, booleanValue, isNull
    for k in ("longValue", "stringValue", "doubleValue", "booleanValue"):
        if k in cell:
            return cell[k]
    if cell.get("isNull"):
        return None
    return None

def get_id_from_response(resp: Dict[str, Any]) -> Optional[int]:
    # Some engines put IDs in generatedFields, some in records with RETURNING
    gf = resp.get("generatedFields")
    if isinstance(gf, list) and gf:
        v = _cell_value(gf[0])
        return int(v) if v is not None else None
    recs: List[List[Dict[str, Any]]] = resp.get("records") or []
    if recs and recs[0]:
        v = _cell_value(recs[0][0])
        try:
            return int(v) if v is not None else None
        except (TypeError, ValueError):
            return None
    return None

def fetch_scalar(sql: str) -> Optional[Any]:
    resp = exec_sql(sql)
    recs = resp.get("records") or []
    if recs and recs[0]:
        return _cell_value(recs[0][0])
    return None

def main():
    print("Seeding one insurance → doctor → client → triage row...")

    # 1) Insurance
    resp = exec_sql("INSERT INTO insurance (ins_pol) VALUES ('Aetna') RETURNING ins_id;")
    ins_id = get_id_from_response(resp)
    if ins_id is None:
        ins_id = fetch_scalar("SELECT ins_id FROM insurance WHERE ins_pol = 'Aetna' ORDER BY ins_id DESC LIMIT 1;")
    if ins_id is None:
        raise RuntimeError("Could not determine ins_id after insert")

    print(f"INS_ID = {ins_id}")

    # 2) Doctor
    resp = exec_sql("INSERT INTO doctor (doc_fn, doc_ln) VALUES ('Meredith','Grey') RETURNING doc_id;")
    doc_id = get_id_from_response(resp)
    if doc_id is None:
        doc_id = fetch_scalar("SELECT doc_id FROM doctor WHERE doc_fn='Meredith' AND doc_ln='Grey' ORDER BY doc_id DESC LIMIT 1;")
    if doc_id is None:
        raise RuntimeError("Could not determine doc_id after insert")

    print(f"DOC_ID = {doc_id}")

    # 3) Client
    resp = exec_sql(f"""
        INSERT INTO client (client_fn, client_ln, client_dob, ins_pol_id)
        VALUES ('Ada','Lovelickle','1997-11-01', {ins_id})
        RETURNING client_id;
    """)
    client_id = get_id_from_response(resp)
    if client_id is None:
        client_id = fetch_scalar(f"""
            SELECT client_id FROM client
            WHERE client_fn='Ada' AND client_ln='Lovelace' AND ins_pol_id={ins_id}
            ORDER BY client_id DESC LIMIT 1;
        """)
    if client_id is None:
        raise RuntimeError("Could not determine client_id after insert")

    print(f"CLIENT_ID = {client_id}")

    # 4) Triage
    exec_sql(f"""
        INSERT INTO triage (
            agent_id, client_id, re_conf, gob_conf, mfm_conf, uro_conf, mis_conf, go_conf,
            doc_id1, agent_notes, sent_to_epic
        )
        VALUES (102, {client_id}, 11, 73, 41, 16, 6, 4, {doc_id}, 'Initial referral from chatbot', FALSE);
    """)
    print("Inserted one triage row ✅")

    # 5) Verify
    rows = exec_sql("""
        SELECT t.triage_id, t.agent_id, t.client_id, t.date_time
        FROM triage t
        ORDER BY t.triage_id DESC
        LIMIT 5;
    """).get("records", [])
    print("Recent triages:", rows)

if __name__ == "__main__":
    main()
