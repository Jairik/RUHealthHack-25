# Activate the virtual environment and install dependencies
python -m venv venv
source venv/bin/activate
pip install uv
uv pip install -r requirements.txt

# Start the backend server on localhost:8000
python3 -m uvicorn app:app --reload --host 127.0.0.1 --port 8000