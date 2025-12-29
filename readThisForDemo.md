# Notes for Running Test Build

## Backend (run in root directory):
1. pip install -r requirements.txt
2. python -m uvicorn app:app

## Frontend 
(MAKE SURE TO CD INTO FRONTEND FIRST):
1. npm install
2. npm run dev

note: run backend (root terminal) and frontend (cd'ed into frontend) in separate terminal windows
another note: i redid the database schema to work with SQLite instead of AWS Aurora (for demo purposes)
third note: i added the ability to remove a triage case from the dashboard, this is conveneient for testing and real-world use

- anuj 

## Helper bash scripts

## Full application

To run the full application while downloading dependencies:
```bash
bash runDemo.sh
```
To **skip dependency installation** (most common use case), 
```bash
bash sdRunDemo.sh
```

## For debugging puposes:

Frontend only
```bash
bash runFrontend.sh
```
Backend only: 
```bash
bash runBackend.sh
```