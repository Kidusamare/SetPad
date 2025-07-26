from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import all the refactored modules
from schemas import TableSchema, AICoachingRequest, AICoachingResponse
from models import Base, Table as TableModelDB
from db import SessionLocal, get_db, db_table_to_schema
from get_endpoints import get_start_page, get_tables, get_table, get_workout_analysis
from put_post_endpoints import (
    create_table, update_table, import_data, import_data_simple,
    ai_coaching_chat, generate_workout_plan, get_exercise_suggestions
)

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Fitness Tracker API", description="AI-powered fitness tracking and coaching API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # More secure CORS
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Schemas are now imported from schemas.py module

# Helper functions are now imported from db.py module

# AI functions are now imported from ai.py module

# --- API Routes ---
# GET endpoints
app.get("/")(get_start_page)
app.get("/tables", response_model=List[TableSchema])(get_tables)
app.get("/tables/{table_id}", response_model=TableSchema)(get_table)
app.get("/ai-coaching/workout-analysis")(get_workout_analysis)

# POST/PUT endpoints
app.post("/tables", response_model=TableSchema)(create_table)
app.put("/tables/{table_id}", response_model=TableSchema)(update_table)
app.post("/import-data")(import_data)
app.post("/import-data-simple")(import_data_simple)
app.post("/ai-coaching", response_model=AICoachingResponse)(ai_coaching_chat)
app.post("/ai-coaching/generate-workout")(generate_workout_plan)
app.post("/ai-coaching/exercise-suggestions")(get_exercise_suggestions)

# DELETE endpoints (kept in main.py as requested)
@app.delete("/tables/{table_id}")
def delete_table(table_id: str, db: Session = Depends(get_db)):
    """Delete a workout table by ID"""
    db_table = db.query(TableModelDB).filter(TableModelDB.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
    db.delete(db_table)
    db.commit()
    return {"success": True}

# Import endpoints moved to put_post_endpoints.py

# AI Coaching schemas moved to schemas.py

# AI coaching functions moved to ai.py

# AI coaching endpoints moved to put_post_endpoints.py


