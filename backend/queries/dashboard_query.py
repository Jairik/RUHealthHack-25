from typing import List, Optional, Tuple, List
from AWS_connect import get_rds_client, get_envs

_rds = get_rds_client()
_DB_CLUSTER_ARN, _DB_SECRET_ARN, _DB_NAME = get_envs()

def _execute_sql(sql: str) -> List[dict]:
	"""Helper function to execute a SQL statement via RDS Data API and return records."""
	response = _rds.execute_statement(
		resourceArn=_DB_CLUSTER_ARN,
		secretArn=_DB_SECRET_ARN,
		database=_DB_NAME,
		sql=sql,
	)
	return response.get('records', [])

def _execute_sql_params(sql: str, parameters: List[dict]) -> List[dict]:
	"""Helper function to execute a SQL statement with parameters via RDS Data API and return records."""
	response = _rds.execute_statement(
		resourceArn=_DB_CLUSTER_ARN,
		secretArn=_DB_SECRET_ARN,
		database=_DB_NAME,
		sql=sql,
		parameters=parameters
	)
	return response.get('records', [])

def _rows_to_dicts(resp) -> List[Dict[str, Any]]:
	"""Convert RDS Data API response rows to list of dictionaries."""
	if not resp:
		return []
	column_names = [col['name'] for col in resp['columnMetadata']]
	result = []
	for row in resp['records']:
		row_dict = {}
		for col_name, col_value in zip(column_names, row):
			if 'stringValue' in col_value:
				row_dict[col_name] = col_value['stringValue']
			elif 'longValue' in col_value:
				row_dict[col_name] = col_value['longValue']
			elif 'doubleValue' in col_value:
				row_dict[col_name] = col_value['doubleValue']
			elif 'booleanValue' in col_value:
				row_dict[col_name] = col_value['booleanValue']
			elif 'isNull' in col_value and col_value['isNull']:
				row_dict[col_name] = None
			else:
				row_dict[col_name] = None
		result.append(row_dict)
	return result

TZ = 'America/New_York'
SPECIALTY_COLS = [
	("Minimally Invasive Surgery", "mis_conf"),
	("General OB/GYN", "gob_conf"),
	("Reproductive Endocrinology", "re_conf"),
	("Urogynecology", "uro_conf"),
	("Gynecologic Oncology", "go_conf"),
	("Maternal-Fetal Medicine", "mfm_conf")
]

def q_total_triages() -> int:
	res = _execute_sql("SELECT COUNT(*) AS total FROM triage;")
	return int(res["records"][0][0]["longValue"])

def q_cases_today(tz: str = TZ) -> int:
    sql = """
    SELECT COUNT(*) AS cnt
    FROM triage
    WHERE (date_time AT TIME ZONE :tz)::date = (now() AT TIME ZONE :tz)::date;
    """
    res = _execute_sql_params(sql, [{"name":"tz","value":{"stringValue":tz}}])
    return int(res["records"][0][0]["longValue"])

def q_cases_this_week(tz: str = TZ) -> int:
    sql = """
    WITH now_local AS (SELECT (now() AT TIME ZONE :tz) AS n)
    SELECT COUNT(*) AS cnt
    FROM triage, now_local
    WHERE (date_time AT TIME ZONE :tz)::date >= (date_trunc('week', n)::date)
      AND (date_time AT TIME ZONE :tz)::date <= (n)::date;
    """
    res = _execute_sql_params(sql, [{"name":"tz","value":{"stringValue":tz}}])
    return int(res["records"][0][0]["longValue"])

def q_search_triages(term: Optional[str], page: int = 1, page_size: int = 20) -> Dict[str, Any]:
    term = (term or "").strip()
    offset = (max(page,1)-1) * page_size

    where = []
    params = [
        {"name":"limit","value":{"longValue":page_size}},
        {"name":"offset","value":{"longValue":offset}},
    ]
    if term:
        where.append("""
        (
          c.client_fn ILIKE :q OR
          c.client_ln ILIKE :q OR
          t.agent_id::text ILIKE :q OR
          ('TRG-' || lpad(t.triage_id::text, 3, '0')) ILIKE :q
        )
        """)
        params.append({"name":"q","value":{"stringValue":f"%{term}%"}})
    where_sql = "WHERE " + " AND ".join(where) if where else ""

    sql = f"""
    WITH base AS (
      SELECT
        t.triage_id, t.agent_id, t.client_id, t.date_time,
        t.re_conf, t.mfm_conf, t.uro_conf, t.gob_conf, t.mis_conf, t.go_conf,
        t.doc_id1, t.doc_id2, t.doc_id3,
        t.agent_notes,
        COALESCE(t.sent_to_epic, false) AS sent_to_epic,
        t.epic_sent_date,
        c.client_fn, c.client_ln, c.client_dob,
        d1.doc_fn AS doc1_fn, d1.doc_ln AS doc1_ln
      FROM triage t
      JOIN client c ON c.client_id = t.client_id
      LEFT JOIN doctor d1 ON d1.doc_id = t.doc_id1
      {where_sql}
      ORDER BY t.triage_id DESC
      LIMIT :limit OFFSET :offset
    )
    SELECT * FROM base;
    """
    res = _execute_sql_params(sql, params)
    rows = _rows_to_dicts(res)

    items = []
    for r in rows:
        case_number = f"TRG-{str(r['triage_id']).zfill(3)}"
        rec_doc = None
        if r.get("doc1_fn") or r.get("doc1_ln"):
            rec_doc = f"Dr. {r.get('doc1_fn','').strip()} {r.get('doc1_ln','').strip()}".strip()

        spec_vals = []
        for label, col in SPECIALTY_COLS:
            v = r.get(col)
            try:
                v = int(v) if v is not None else 0
            except:
                v = 0
            spec_vals.append({"name": label, "confidence": v})
        best = max(spec_vals, key=lambda s: s["confidence"]) if spec_vals else {"name": None, "confidence": 0}

        items.append({
            "id": str(r["triage_id"]),
            "case_number": case_number,
            "agent_id": r["agent_id"],
            "patient_first_name": r.get("client_fn"),
            "patient_last_name": r.get("client_ln"),
            "patient_dob": str(r["client_dob"]) if r.get("client_dob") else None,
            "created_date": str(r["date_time"]),
            "health_history": [],
            "conversation_history": [],
            "final_recommendation": best["name"],
            "confidence_score": best["confidence"],
            "recommended_doctor": rec_doc,
            "subspecialist_confidences": spec_vals,
            "status": "completed",
            "agent_notes": r.get("agent_notes"),
            "sent_to_epic": bool(r.get("sent_to_epic", False)),
            "epic_sent_date": str(r["epic_sent_date"]) if r.get("epic_sent_date") else None
        })

    count_sql = f"""
      SELECT COUNT(*) AS cnt
      FROM triage t
      JOIN client c ON c.client_id = t.client_id
      {where_sql};
    """
    count_res = _execute_sql_params(count_sql, [p for p in params if p["name"] == "q"])
    total = int(count_res["records"][0][0]["longValue"]) if count_res.get("records") else 0

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size
    }

def q_mark_sent_to_epic(triage_id: int):
    sql = """
    UPDATE triage
    SET sent_to_epic = TRUE, epic_sent_date = now()
    WHERE triage_id = :tid
    RETURNING triage_id, sent_to_epic, epic_sent_date;
    """
    res = _execute_sql_params(sql, [{"name":"tid","value":{"longValue":triage_id}}])
    rows = _rows_to_dicts(res)
    return rows[0] if rows else None