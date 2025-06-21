import os
import json
from models import TrainingLog

DATA_DIR = "logs"

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def _path(log_id: str) -> str:
    return os.path.join(DATA_DIR, f"{log_id}.json")

def save_log(log: TrainingLog):
    with open(_path(log.id), "w") as f:
        json.dump(log.dict(), f, indent=2)

def load_log(log_id: str):
    try:
        with open(_path(log_id), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def delete_log(log_id: str) -> bool:
    try:
        os.remove(_path(log_id))
        return True
    except FileNotFoundError:
        return False

def list_logs():
    logs = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(DATA_DIR, filename), "r") as f:
                data = json.load(f)
                logs.append({
                    "id": data.get("id"),
                    "tableName": data.get("tableName"),
                    "date": data.get("date")
                })
    return logs
