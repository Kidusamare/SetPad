import os
import json
from models import TrainingLog

# Directory to store log files
DATA_DIR = "logs"
os.makedirs(DATA_DIR, exist_ok=True)

def _path(log_id: str) -> str:
    """
    Returns the full file path for a given training log ID.
    This ensures all log files go inside the /logs folder.
    """
    return os.path.join(DATA_DIR, f"{log_id}.json")

def save_log(log: TrainingLog):
    print("Saving log with ID:", log.id)
    print("Log data:", log.dict())
    with open(_path(log.id), "w") as f:
        json.dump(log.dict(), f, indent=2)

def load_log(log_id: str):
    """
    Loads a training log from disk by its ID.
    Returns the parsed dictionary, or None if not found.
    """
    try:
        with open(_path(log_id), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def delete_log(log_id: str):
    """
    Deletes the JSON file for the given log ID.
    Returns True if successful, False if not found.
    """
    try:
        os.remove(_path(log_id))
        return True
    except FileNotFoundError:
        return False

def list_logs():
    """
    Lists all valid training logs stored in the logs directory.
    Parses each .json file into a dictionary.
    Skips any file that is corrupt or unreadable.
    """
    logs = []
    for file in os.listdir(DATA_DIR):
        if file.endswith(".json"):
            with open(os.path.join(DATA_DIR, file), "r") as f:
                try:
                    logs.append(json.load(f))
                except Exception:
                    continue  # skip corrupt files
    return logs
