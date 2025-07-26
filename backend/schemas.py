from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SetSchema(BaseModel):
    id: Optional[int] = None
    reps: str
    weight: str
    class Config:
        orm_mode = True

class RowSchema(BaseModel):
    id: Optional[int] = None
    muscleGroup: str
    exercise: str
    sets: List[SetSchema]
    notes: Optional[str] = ""
    showNotes: Optional[bool] = False
    weightUnit: Optional[str] = "lbs"
    class Config:
        orm_mode = True

class TableSchema(BaseModel):
    id: str
    tableName: str
    date: str
    rows: List[RowSchema]
    class Config:
        orm_mode = True

class MessageSchema(BaseModel):
    id: Optional[int] = None
    type: str  # "user" or "ai"
    content: str
    timestamp: Optional[str] = None

class AICoachingRequest(BaseModel):
    message: str
    conversation_history: List[MessageSchema] = []
    user_data: Optional[Dict[str, Any]] = None

class AICoachingResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None
    workout_plan: Optional[Dict[str, Any]] = None

"""
# README: Pydantic Schemas Module

## Overview
This module contains all Pydantic schemas used for data validation and serialization 
throughout the fitness tracker API. These schemas define the structure of data that 
flows between the frontend and backend, ensuring type safety and data consistency.

## Schemas

### Core Workout Schemas
- **SetSchema**: Represents a single set of an exercise with reps and weight
  - Used in: Exercise tracking, workout logging
  - Fields: id, reps, weight

- **RowSchema**: Represents an exercise with multiple sets
  - Used in: Workout tables, exercise management
  - Fields: id, muscleGroup, exercise, sets, notes, showNotes, weightUnit

- **TableSchema**: Represents a complete workout session
  - Used in: Workout storage, workout history
  - Fields: id, tableName, date, rows

### AI Coaching Schemas
- **MessageSchema**: Represents a single message in AI coaching conversations
  - Used in: Chat history, conversation flow
  - Fields: id, type, content, timestamp

- **AICoachingRequest**: Request payload for AI coaching interactions
  - Used in: AI chat endpoints
  - Fields: message, conversation_history, user_data

- **AICoachingResponse**: Response from AI coaching system
  - Used in: AI chat responses
  - Fields: response, suggestions, workout_plan

## Usage Examples

### Creating a workout table:
```python
workout = TableSchema(
    id="workout_20250126",
    tableName="Push Day",
    date="2025-01-26",
    rows=[
        RowSchema(
            muscleGroup="Chest",
            exercise="Bench Press",
            sets=[
                SetSchema(reps="10", weight="135"),
                SetSchema(reps="8", weight="145")
            ]
        )
    ]
)
```

### AI coaching request:
```python
request = AICoachingRequest(
    message="What's a good chest workout?",
    conversation_history=[
        MessageSchema(type="user", content="Hi there!")
    ]
)
```

## Configuration
All schemas use `orm_mode = True` for compatibility with SQLAlchemy ORM models,
allowing automatic conversion between database models and Pydantic schemas.
"""