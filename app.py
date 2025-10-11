''' FastAPI endpoints here '''

from fastapi import FastAPI

app = FastAPI()

# Basic example endpoint
@app.get("/api/health")
def health():
    return {"ok": True}