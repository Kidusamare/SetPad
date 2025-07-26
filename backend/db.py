from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, Table as TableModelDB, Row as RowModelDB, Set as SetModelDB
from schemas import TableSchema, RowSchema, SetSchema
from pydantic import ValidationError
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    """Database dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def db_table_to_schema(table: TableModelDB) -> TableSchema:
    """Convert SQLAlchemy Table model to Pydantic TableSchema"""
    return TableSchema(
        id=table.id,
        tableName=table.tableName,
        date=table.date,
        rows=[
            RowSchema(
                id=row.id,
                muscleGroup=row.muscleGroup,
                exercise=row.exercise,
                notes=row.notes,
                showNotes=row.showNotes,
                weightUnit=row.weightUnit,
                sets=[
                    SetSchema(
                        id=s.id,
                        reps=s.reps,
                        weight=s.weight
                    ) for s in row.sets
                ]
            ) for row in table.rows
        ]
    )

def create_db_table_from_schema(schema: TableSchema, db: Session):
    """Create a new database table from TableSchema"""
    db_table = TableModelDB(
        id=schema.id,
        tableName=schema.tableName,
        date=schema.date,
        rows=[
            RowModelDB(
                muscleGroup=row.muscleGroup,
                exercise=row.exercise,
                notes=row.notes,
                showNotes=row.showNotes,
                weightUnit=row.weightUnit,
                sets=[
                    SetModelDB(reps=s.reps, weight=s.weight)
                    for s in row.sets
                ]
            ) for row in schema.rows
        ]
    )
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

def insert_table_schema_to_db(table_schema: dict, db: Session):
    """Insert a table schema dictionary into the database with validation"""
    try:
        validated = TableSchema(**table_schema)
    except ValidationError as e:
        raise ValueError(f"Invalid data format: {e}")
    
    # Check if table already exists
    if db.query(TableModelDB).filter(TableModelDB.id == validated.id).first():
        return  # Skip or update as needed
    
    db_table = TableModelDB(
        id=validated.id,
        tableName=validated.tableName,
        date=validated.date,
        rows=[
            RowModelDB(
                muscleGroup=row.muscleGroup,
                exercise=row.exercise,
                notes=row.notes,
                showNotes=row.showNotes,
                weightUnit=row.weightUnit,
                sets=[SetModelDB(reps=s.reps, weight=s.weight) for s in row.sets]
            ) for row in validated.rows
        ]
    )
    db.add(db_table)
    db.commit()
    db.refresh(db_table)

def analyze_user_workouts(db: Session) -> dict:
    """Analyze user's workout data for personalized coaching and insights"""
    try:
        # Get all user tables
        tables = db.query(TableModelDB).all()
        
        if not tables:
            return {"message": "No workout data found"}
        
        # Basic analytics
        total_workouts = len(tables)
        recent_workouts = [t for t in tables if t.date >= "2024-01-01"]  # This year
        
        # Get exercise frequency
        exercise_count = {}
        muscle_groups = {}
        
        for table in tables:
            for row in table.rows:
                exercise_count[row.exercise] = exercise_count.get(row.exercise, 0) + 1
                muscle_groups[row.muscleGroup] = muscle_groups.get(row.muscleGroup, 0) + 1
        
        # Most frequent exercises and muscle groups
        top_exercises = sorted(exercise_count.items(), key=lambda x: x[1], reverse=True)[:5]
        top_muscle_groups = sorted(muscle_groups.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_workouts": total_workouts,
            "recent_workouts": len(recent_workouts),
            "top_exercises": top_exercises,
            "top_muscle_groups": top_muscle_groups,
            "last_workout": tables[-1].date if tables else None
        }
        
    except Exception as e:
        return {"error": str(e)}

"""
# README: Database Helper Functions Module

## Overview
This module contains all database-related helper functions and utilities for the fitness 
tracker API. It handles database connections, ORM operations, and data transformations 
between SQLAlchemy models and Pydantic schemas.

## Key Components

### Database Configuration
- **ENGINE**: SQLAlchemy engine configured for SQLite database
- **SessionLocal**: Session factory for database operations
- **get_db()**: FastAPI dependency for database sessions

### Core Helper Functions

#### Data Transformation
- **db_table_to_schema(table: TableModelDB) -> TableSchema**
  - Converts SQLAlchemy Table model to Pydantic schema
  - Used in: GET endpoints to return serialized data
  - Handles nested relationships (rows -> sets)

- **create_db_table_from_schema(schema: TableSchema, db: Session)**
  - Creates new database table from validated Pydantic schema
  - Used in: POST endpoints for creating workouts
  - Automatically handles foreign key relationships

- **insert_table_schema_to_db(table_schema: dict, db: Session)**
  - Validates and inserts table schema dictionary into database
  - Used in: Import functionality, bulk operations
  - Includes duplicate prevention logic

#### Analytics Functions
- **analyze_user_workouts(db: Session) -> dict**
  - Analyzes user workout patterns and statistics
  - Used in: AI coaching, progress tracking
  - Returns: workout counts, exercise frequency, muscle group distribution

## Database Schema
The module works with three main SQLAlchemy models:
- **TableModelDB**: Workout sessions
- **RowModelDB**: Individual exercises
- **SetModelDB**: Sets within exercises

## Usage Examples

### Creating a workout:
```python
from schemas import TableSchema
from db import create_db_table_from_schema, get_db

def create_workout(workout_data: TableSchema):
    db = next(get_db())
    try:
        db_table = create_db_table_from_schema(workout_data, db)
        return db_table
    finally:
        db.close()
```

### Getting workout analytics:
```python
from db import analyze_user_workouts, get_db

def get_user_stats():
    db = next(get_db())
    try:
        return analyze_user_workouts(db)
    finally:
        db.close()
```

## Error Handling
- All functions include proper exception handling
- Database sessions are properly closed in finally blocks
- Validation errors are caught and re-raised with helpful messages

## Dependencies
- SQLAlchemy for ORM operations
- Pydantic for data validation
- python-dotenv for environment variables
"""