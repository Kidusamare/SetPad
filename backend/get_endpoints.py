from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas import TableSchema, AICoachingResponse
from models import Table as TableModelDB
from db import get_db, db_table_to_schema, analyze_user_workouts
from ai import generate_ai_workout_analysis

def get_start_page():
    """Root endpoint - API health check"""
    return {"SetPad Backend Running"}

def get_tables(db: Session = Depends(get_db)) -> List[TableSchema]:
    """Get all workout tables efficiently ordered by sort_order (latest first)"""
    from sqlalchemy import desc
    # Use database-level sorting with index for maximum efficiency
    tables = db.query(TableModelDB).order_by(desc(TableModelDB.sort_order)).all()
    return [db_table_to_schema(t) for t in tables]

def get_table(table_id: str, db: Session = Depends(get_db)) -> TableSchema:
    """Get a specific workout table by ID"""
    table = db.query(TableModelDB).filter(TableModelDB.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return db_table_to_schema(table)

def get_workout_analysis(db: Session = Depends(get_db)):
    """Get AI analysis of user's workout patterns"""
    try:
        analytics = analyze_user_workouts(db)
        
        if "error" in analytics:
            raise HTTPException(status_code=500, detail=analytics["error"])
        
        # Generate AI insights
        ai_insights = generate_ai_workout_analysis(analytics)
        
        return {
            "analytics": analytics,
            "ai_insights": ai_insights
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

"""
# README: GET Endpoints Module

## Overview
This module contains all GET endpoints for the fitness tracker API. These endpoints handle 
data retrieval operations including workout tables, individual workouts, and AI-powered 
analytics and insights.

## Endpoints

### Core Data Retrieval

#### `GET /` - Root Endpoint
- **Function**: `get_start_page()`
- **Purpose**: API health check and status verification
- **Returns**: Simple JSON message confirming backend is running
- **Use Case**: Frontend connectivity testing, deployment verification

#### `GET /tables` - Get All Workout Tables
- **Function**: `get_tables(db: Session)`
- **Purpose**: Retrieve all user workout sessions
- **Returns**: List[TableSchema] - All workout tables sorted by date (latest first)
- **Features**:
  - Automatic date sorting (newest workouts first)
  - Complete workout data including exercises and sets
  - Optimized for dashboard and workout history views
- **Use Cases**: Dashboard loading, workout history browsing

#### `GET /tables/{table_id}` - Get Specific Workout
- **Function**: `get_table(table_id: str, db: Session)`
- **Purpose**: Retrieve a single workout session by ID
- **Parameters**: 
  - `table_id`: Unique identifier for the workout table
- **Returns**: TableSchema - Complete workout details
- **Error Handling**: 404 if table not found
- **Use Cases**: Workout editing, detailed workout view, workout sharing

### AI-Powered Analytics

#### `GET /ai-coaching/workout-analysis` - Workout Pattern Analysis
- **Function**: `get_workout_analysis(db: Session)`
- **Purpose**: AI-powered analysis of user's training patterns
- **Returns**: Object containing:
  - `analytics`: Raw workout statistics and patterns
  - `ai_insights`: AI-generated insights and recommendations
- **Features**:
  - Training frequency analysis
  - Exercise variety assessment
  - Muscle group balance evaluation
  - Personalized improvement recommendations
- **Use Cases**: Progress tracking, training optimization, AI coaching dashboard

## Data Flow

### Typical GET Request Flow:
1. **Client Request**: Frontend makes GET request to endpoint
2. **Database Query**: Function queries SQLAlchemy models via database session
3. **Data Transformation**: Raw database models converted to Pydantic schemas
4. **AI Enhancement** (if applicable): Additional AI processing for insights
5. **Response**: Structured JSON response returned to client

### Error Handling:
- **404 Not Found**: When specific resources don't exist
- **500 Internal Server Error**: For database or AI processing errors
- **Validation**: Automatic Pydantic schema validation
- **Database Sessions**: Proper session management with automatic cleanup

## Performance Considerations

### Optimization Features:
- **Date Sorting**: Efficient in-memory sorting for chronological workout display
- **Lazy Loading**: Database relationships loaded only when needed
- **Schema Conversion**: Efficient ORM to Pydantic conversion
- **Connection Pooling**: Database connections managed by SQLAlchemy

### Response Sizes:
- Individual workouts: Small (typically < 5KB)
- All workouts: Variable (depends on workout history)
- Analytics: Medium (includes computed statistics and AI insights)

## Dependencies

### Required Modules:
- **FastAPI**: HTTP exception handling and dependency injection
- **SQLAlchemy**: Database ORM and session management
- **Pydantic**: Response model validation and serialization
- **Custom modules**: schemas, models, db, ai

### Database Dependencies:
- Requires active database connection via `get_db()` dependency
- Uses SQLAlchemy session for all database operations

### AI Dependencies:
- OpenAI API integration for workout analysis
- Requires valid API key configuration
- Graceful fallback for AI service unavailability

## Usage Examples

### Get all workouts:
```python
from get_endpoints import get_tables
from db import get_db

db = next(get_db())
workouts = get_tables(db)
# Returns: [TableSchema, TableSchema, ...]
```

### Get specific workout:
```python
from get_endpoints import get_table

workout = get_table("workout_20250126", db)
# Returns: TableSchema with full workout details
```

### Get AI analysis:
```python
from get_endpoints import get_workout_analysis

analysis = get_workout_analysis(db)
# Returns: {"analytics": {...}, "ai_insights": "..."}
```

## Integration Points

### Frontend Integration:
- Dashboard components consume `/tables` for workout lists
- Detailed workout views use `/tables/{id}` for specific workouts
- Analytics dashboard integrates with `/ai-coaching/workout-analysis`

### API Routes:
These functions are mapped to FastAPI routes in main.py:
```python
app.get("/")(get_start_page)
app.get("/tables", response_model=List[TableSchema])(get_tables)
app.get("/tables/{table_id}", response_model=TableSchema)(get_table)
app.get("/ai-coaching/workout-analysis")(get_workout_analysis)
```
"""