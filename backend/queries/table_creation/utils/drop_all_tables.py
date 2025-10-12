''' Drop all tables from the DB - DEV ONLY '''

import os
import boto3

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# Get environment variables
RESOURCE_ARN = os.getenv("DB_CLUSTER_ARN")
SECRET_ARN   = os.getenv("DB_SECRET_ARN")
REGION       = os.getenv("AWS_REGION", "us-east-1")
DATABASE     = os.getenv("DB_NAME", "postgres")

if not all([RESOURCE_ARN, SECRET_ARN, REGION]):
    raise ValueError("Missing DB_CLUSTER_ARN, DB_SECRET_ARN, or AWS_REGION.")

client = boto3.client("rds-data", region_name=REGION)

# Get all tables in the public schema
def get_all_tables():
    sql = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
    """
    resp = client.execute_statement(
        resourceArn=RESOURCE_ARN,
        secretArn=SECRET_ARN,
        database=DATABASE,
        sql=sql
    )
    tables = [row[0]['stringValue'] for row in resp['records']]
    return tables

# Drop each table
def drop_tables(tables):
    for t in tables:
        try:
            print(f"Dropping table: {t} ...")
            client.execute_statement(
                resourceArn=RESOURCE_ARN,
                secretArn=SECRET_ARN,
                database=DATABASE,
                sql=f"DROP TABLE IF EXISTS {t} CASCADE;"
            )
            print(f"✅ Dropped {t}")
        except Exception as e:
            print(f"❌ Error dropping {t}: {e}")

def main():
    tables = get_all_tables()
    if not tables:
        print("No tables found.")
        return
    print(f"Found {len(tables)} tables: {tables}")
    confirm = input("Are you sure you want to drop ALL of them? (yes/no): ").strip().lower()
    if confirm == "yes":
        drop_tables(tables)
    else:
        print("Cancelled.")

if __name__ == "__main__":
    main()
