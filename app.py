''' FastAPI endpoints here '''

from fastapi import FastAPI

app = FastAPI()

# Basic example endpoint
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}