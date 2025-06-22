from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import TrainingLog
import db

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/tables")
def list_logs():
    return db.list_logs()

@app.get("/api/tables/{log_id}")
def get_log(log_id: str):
    log = db.load_log(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@app.post("/api/tables")
def save_log(log: TrainingLog):
    db.save_log(log)
    return log

@app.delete("/api/tables/{log_id}")
def delete_log(log_id: str):
    success = db.delete_log(log_id)
    if not success:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"success": True}