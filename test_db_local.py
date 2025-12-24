from backend.queries import general_queries as gq
from backend.queries import dashboard_query as dq
from backend.db import init_db
import random

def test():
    print("Initializing DB...")
    init_db()

    print("Creating Client...")
    cid = gq.q_get_or_create_client("Test", "User", "1990-01-01")
    print(f"Client ID: {cid}")

    print("Starting Triage...")
    tid = gq.q_start_triage(123, cid)
    print(f"Triage ID: {tid}")

    print("Answering question...")
    gq.q_insert_triage_question(tid, "What is up?", "Not much")

    print("Updating inference...")
    subs = [{"subspecialty_short": "REI", "percent_match": 0.85}]
    conds = [{"condition": "PCOS", "probability": 0.5}]
    docs = [{"rank": 1, "name": "Dr. House"}]
    gq.q_update_triage_from_inference(tid, subs, conds, docs)

    print("Checking Dashboard Stats...")
    stats = {
        "total": dq.q_total_triages(),
        "today": dq.q_cases_today(),
        "week": dq.q_cases_this_week()
    }
    print(f"Stats: {stats}")

    print("Searching Triages...")
    res = dq.q_search_triages("Test")
    print(f"Search found {res['total']} items.")

    print("Success!")

try:
    test()
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
