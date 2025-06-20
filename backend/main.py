from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import TrainingLog
import db  # This is your db.py module

app = FastAPI()

# Allow frontend requests (important for local dev!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:5173"] if you're using Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== ROUTES ==========

@app.get("/api/tables")
def get_all_logs():
    """
    List all training logs.
    Reads all .json files from the logs/ folder.
    """
    return db.list_logs()

@app.get("/api/tables/{log_id}")
def get_log(log_id: str):
    """
    Load a specific training log by ID.
    """
    log = db.load_log(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@app.post("/api/tables")
def save_log(log: TrainingLog):
    """
    Save a new or updated training log.
    Overwrites if the ID already exists.
    """
    db.save_log(log)
    return log

@app.delete("/api/tables/{log_id}")
def delete_log(log_id: str):
    """
    Delete a training log by ID.
    """
    success = db.delete_log(log_id)
    if not success:
        raise HTTPException(status_code=404, detail="Log not found")
    return { "success": True }
