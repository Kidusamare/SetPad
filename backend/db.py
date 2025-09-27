from collections import Counter
import os
from datetime import UTC, datetime
from typing import Optional

from sqlalchemy import create_engine, desc, text
from sqlalchemy.orm import sessionmaker, Session

from models import Base, Table as TableModelDB, Row as RowModelDB, Set as SetModelDB
from schemas import TableSchema, RowSchema, SetSchema
from pydantic import ValidationError
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def check_and_add_sort_order_column():
    """Check if sort_order column exists, if not add it and migrate data"""
    db = SessionLocal()
    try:
        # Try to query the sort_order column to see if it exists
        try:
            db.execute(text("SELECT sort_order FROM tables LIMIT 1"))
            print("sort_order column already exists")
            return
        except Exception:
            print("sort_order column doesn't exist, adding it...")
            
        # Add the sort_order column
        db.execute(text("ALTER TABLE tables ADD COLUMN sort_order INTEGER"))
        db.commit()
        print("Added sort_order column successfully")
        
        # Now migrate existing data
        tables = db.query(TableModelDB).all()
        if tables:
            print(f"Migrating {len(tables)} existing tables with sort_order...")
            
            # Sort tables by date for proper ordering
            sorted_tables = sorted(tables, 
                                 key=lambda t: datetime.strptime(t.date, "%Y-%m-%d") if t.date else datetime.min, 
                                 reverse=True)
            
            # Assign sort_order values with gaps for future insertions
            for i, table in enumerate(sorted_tables):
                table.sort_order = (len(sorted_tables) - i) * 1000
            
            db.commit()
            print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration error: {e}")
        db.rollback()
    finally:
        db.close()

# Run migration on startup
check_and_add_sort_order_column()

def get_db():
    """Database dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_sort_order_for_date(date_str: str, db: Session) -> int:
    """Calculate a deterministic sort_order value for the provided date."""

    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        max_order = db.query(TableModelDB.sort_order).order_by(desc(TableModelDB.sort_order)).first()
        return (max_order[0] + 1000) if max_order and max_order[0] is not None else 1000

    base_value = int(target_date.strftime("%Y%m%d")) * 1000

    same_day_order = (
        db.query(TableModelDB.sort_order)
        .filter(TableModelDB.date == date_str, TableModelDB.sort_order.isnot(None))
        .order_by(desc(TableModelDB.sort_order))
        .first()
    )
    if same_day_order and same_day_order[0] >= base_value:
        return same_day_order[0] + 1

    return base_value

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
    try:
        sort_order = get_sort_order_for_date(schema.date, db)
    except Exception as e:
        print(f"Error calculating sort_order, using default: {e}")
        sort_order = 1000
    
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
    try:
        sort_order = get_sort_order_for_date(validated.date, db)
    except Exception as e:
        print(f"Error calculating sort_order, using default: {e}")
        sort_order = 1000
    
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

def _safe_parse_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def analyze_user_workouts(db: Session, user_id: Optional[int] = None) -> dict:
    """Analyze workout data with safe defaults for empty datasets."""

    try:
        query = db.query(TableModelDB)
        if user_id is not None:
            query = query.filter(TableModelDB.user_id == user_id)

        tables = query.all()

        base_response = {
            "total_workouts": len(tables),
            "recent_workouts": 0,
            "top_exercises": [],
            "top_muscle_groups": [],
            "last_workout": None,
        }

        if not tables:
            base_response["message"] = "No workout data found"
            return base_response

        exercise_counter: Counter[str] = Counter()
        muscle_counter: Counter[str] = Counter()
        parsed_dates = []

        current_year = datetime.now(UTC).year

        for table in tables:
            parsed_date = _safe_parse_date(table.date)
            if parsed_date:
                parsed_dates.append(parsed_date)
                if parsed_date.year == current_year:
                    base_response["recent_workouts"] += 1

            for row in table.rows:
                if row.exercise:
                    exercise_counter[row.exercise] += 1
                if row.muscleGroup:
                    muscle_counter[row.muscleGroup] += 1

        if parsed_dates:
            base_response["last_workout"] = max(parsed_dates).strftime("%Y-%m-%d")

        base_response["top_exercises"] = exercise_counter.most_common(5)
        base_response["top_muscle_groups"] = muscle_counter.most_common(5)

        return base_response

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
- **analyze_user_workouts(db: Session, user_id: Optional[int] = None) -> dict**
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
