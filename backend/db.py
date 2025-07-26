from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, Session
from models import Base, Table as TableModelDB, Row as RowModelDB, Set as SetModelDB
from schemas import TableSchema, RowSchema, SetSchema
from pydantic import ValidationError
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def migrate_existing_data_with_sort_order():
    """Migrate existing tables to add sort_order field for efficient sorting"""
    db = SessionLocal()
    try:
        # Check if migration is needed
        tables_without_sort_order = db.query(TableModelDB).filter(
            TableModelDB.sort_order.is_(None)
        ).all()
        
        if not tables_without_sort_order:
            return  # Already migrated
        
        print(f"Migrating {len(tables_without_sort_order)} tables with sort_order...")
        
        # Sort tables by date for proper ordering
        sorted_tables = sorted(tables_without_sort_order, 
                             key=lambda t: datetime.strptime(t.date, "%Y-%m-%d") if t.date else datetime.min, 
                             reverse=True)
        
        # Assign sort_order values with gaps for future insertions
        for i, table in enumerate(sorted_tables):
            table.sort_order = (len(sorted_tables) - i) * 1000
        
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

# Run migration on startup
migrate_existing_data_with_sort_order()

def get_db():
    """Database dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_sort_order_for_date(date_str: str, db: Session) -> int:
    """Calculate the appropriate sort_order for a given date using binary search approach"""
    try:
        # Convert date string to datetime for comparison
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        # If date format is invalid, put it at the end
        max_order = db.query(TableModelDB.sort_order).order_by(desc(TableModelDB.sort_order)).first()
        return (max_order[0] + 1) if max_order and max_order[0] is not None else 1
    
    # Get all tables ordered by date and sort_order
    existing_tables = db.query(TableModelDB).order_by(desc(TableModelDB.date), desc(TableModelDB.sort_order)).all()
    
    if not existing_tables:
        return 1  # First table
    
    # Binary search to find insertion position
    left, right = 0, len(existing_tables) - 1
    insert_pos = len(existing_tables)  # Default to end
    
    while left <= right:
        mid = (left + right) // 2
        try:
            mid_date = datetime.strptime(existing_tables[mid].date, "%Y-%m-%d")
        except ValueError:
            # Skip invalid dates
            left = mid + 1
            continue
            
        if target_date > mid_date:
            # Target date is newer, should be inserted before this position
            insert_pos = mid
            right = mid - 1
        elif target_date < mid_date:
            # Target date is older, continue searching right
            left = mid + 1
        else:
            # Same date, insert with next sort_order for that date
            same_date_tables = [t for t in existing_tables if t.date == date_str]
            if same_date_tables:
                max_sort_order = max(t.sort_order or 0 for t in same_date_tables)
                return max_sort_order + 1
            else:
                return existing_tables[mid].sort_order + 1
    
    # Calculate sort_order based on insertion position
    if insert_pos == 0:
        # Insert at the beginning (newest)
        return (existing_tables[0].sort_order or 0) + 1000
    elif insert_pos == len(existing_tables):
        # Insert at the end (oldest)
        return (existing_tables[-1].sort_order or 0) - 1000 if existing_tables[-1].sort_order and existing_tables[-1].sort_order > 1000 else 1
    else:
        # Insert between two positions
        prev_order = existing_tables[insert_pos - 1].sort_order or 0
        next_order = existing_tables[insert_pos].sort_order or 0
        return (prev_order + next_order) // 2 if abs(prev_order - next_order) > 1 else prev_order - 1

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
    """Create a new database table from TableSchema with automatic sort order"""
    # Calculate sort order for efficient retrieval
    sort_order = get_sort_order_for_date(schema.date, db)
    
    db_table = TableModelDB(
        id=schema.id,
        tableName=schema.tableName,
        date=schema.date,
        sort_order=sort_order,  # Add sort_order for efficient retrieval
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
    """Insert a table schema dictionary into the database with validation and automatic sort order"""
    try:
        validated = TableSchema(**table_schema)
    except ValidationError as e:
        raise ValueError(f"Invalid data format: {e}")
    
    # Check if table already exists
    if db.query(TableModelDB).filter(TableModelDB.id == validated.id).first():
        return  # Skip or update as needed
    
    # Calculate sort order for efficient retrieval
    sort_order = get_sort_order_for_date(validated.date, db)
    
    db_table = TableModelDB(
        id=validated.id,
        tableName=validated.tableName,
        date=validated.date,
        sort_order=sort_order,  # Add sort_order for efficient retrieval
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