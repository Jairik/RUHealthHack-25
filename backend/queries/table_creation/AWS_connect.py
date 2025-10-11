import os
from pathlib import Path
import boto3
from dotenv import load_dotenv, find_dotenv

def load_env_or_fail():
    # First try automatic discovery from CWD upward
    dotenv_path = find_dotenv(usecwd=True)
    # If not found, fall back to paths relative to this file (works in scripts)
    if not dotenv_path:
        try:
            here = Path(__file__).resolve()
            candidates = [
                here / ".env",
                here.parent / ".env",
                here.parent.parent / ".env",
                here.parent.parent.parent / ".env",
                here.parent.parent.parent.parent / ".env",
                here.parent.parent.parent.parent.parent / ".env",
                here.parent.parent.parent.parent.parent.parent / ".env",
            ]
            for p in candidates:
                if p.is_file():
                    dotenv_path = str(p)
                    break
        except NameError:
            pass  # __file__ may not exist in REPL/Jupyter
    if not load_dotenv(dotenv_path=dotenv_path, override=False):
        raise FileNotFoundError(f".env not found. Tried: {dotenv_path or '(auto search)'}")

def get_rds_client():
    # Ensure environment is loaded before reading
    load_env_or_fail()

    # Read & validate required values
    DB_CLUSTER_ARN = os.getenv("DB_CLUSTER_ARN")
    DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")
    DB_NAME = os.getenv("DB_NAME", "appdb")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

    missing = [k for k, v in {
        "DB_CLUSTER_ARN": DB_CLUSTER_ARN,
        "DB_SECRET_ARN": DB_SECRET_ARN,
        "DB_NAME": DB_NAME,
        "AWS_REGION": AWS_REGION,
    }.items() if not v]
    if missing:
        raise ValueError(f"Missing required env vars: {', '.join(missing)}")

    # Let boto3 resolve credentials via env/shared files/role.
    # Only pass keys if you absolutely must.
    client = boto3.client("rds-data", region_name=AWS_REGION)
    return client

def get_envs():
    ''' Helper to get the environment variables '''
    load_env_or_fail()
    DB_CLUSTER_ARN = os.getenv("DB_CLUSTER_ARN")
    DB_SECRET_ARN = os.getenv("DB_SECRET_ARN")
    DB_NAME = os.getenv("DB_NAME", "appdb")
    return DB_CLUSTER_ARN, DB_SECRET_ARN, DB_NAME