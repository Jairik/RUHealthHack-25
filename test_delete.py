import requests
from backend.db import init_db
from backend.queries import general_queries as gq

BASE_URL = "http://localhost:8000/api"

def test_delete():
    print("Testing delete functionality...")
    
    # 1. Create a case to delete
    print("Creating case...")
    cid = gq.q_get_or_create_client("To Delete", "User", "1990-01-01")
    tid = gq.q_start_triage(999, cid)
    print(f"Created triage {tid}")

    # 2. Verify it exists via API
    res = requests.get(f"{BASE_URL}/triages")
    items = res.json()["items"]
    found = any(str(item["id"]) == str(tid) for item in items)
    if not found:
        print("ERROR: Case not found in list after creation")
        return

    # 3. Delete it via API
    print(f"Deleting triage {tid}...")
    res = requests.delete(f"{BASE_URL}/triages/{tid}")
    print(f"Delete status: {res.status_code}")
    if res.status_code != 200:
        print(f"ERROR: Delete failed {res.text}")
        return

    # 4. Verify it is gone
    res = requests.get(f"{BASE_URL}/triages")
    items = res.json()["items"]
    found = any(str(item["id"]) == str(tid) for item in items)
    if found:
        print("ERROR: Case still exists after delete")
    else:
        print("SUCCESS: Case deleted")

if __name__ == "__main__":
    test_delete()
