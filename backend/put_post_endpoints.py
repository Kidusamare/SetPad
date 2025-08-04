from fastapi import HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from schemas import TableSchema, AICoachingRequest, AICoachingResponse
from models import Table as TableModelDB, Row as RowModelDB, Set as SetModelDB
from db import get_db, create_db_table_from_schema, insert_table_schema_to_db, analyze_user_workouts, db_table_to_schema, SessionLocal
from ai import (
    clean_csv_with_openai, 
    get_ai_coaching_response, 
    generate_ai_workout_plan,
    get_ai_exercise_suggestions
)

def create_table(table: TableSchema, db: Session = Depends(get_db)) -> TableSchema:
    """Create a new workout table"""
    if db.query(TableModelDB).filter(TableModelDB.id == table.id).first():
        raise HTTPException(status_code=400, detail="Table with this ID already exists")
    db_table = create_db_table_from_schema(table, db)
    return db_table_to_schema(db_table)

def update_table(table_id: str, updated_table: TableSchema, db: Session = Depends(get_db)) -> TableSchema:
    """Update an existing workout table with efficient sort order management"""
    from db import get_sort_order_for_date
    
    db_table = db.query(TableModelDB).filter(TableModelDB.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Check if date changed - if so, recalculate sort_order
    date_changed = db_table.date != updated_table.date
    if date_changed:
        try:
            new_sort_order = get_sort_order_for_date(updated_table.date, db)
            db_table.sort_order = new_sort_order
        except Exception as e:
            print(f"Error calculating sort_order on update, keeping existing: {e}")
            # Keep existing sort_order or set default if None
            if not hasattr(db_table, 'sort_order') or db_table.sort_order is None:
                db_table.sort_order = 1000
    
    # Remove old rows/sets
    for row in db_table.rows:
        db.delete(row)
    db.flush()
    
    # Add new rows/sets
    db_table.tableName = updated_table.tableName
    db_table.date = updated_table.date
    db_table.rows = [
        RowModelDB(
            muscleGroup=row.muscleGroup,
            exercise=row.exercise,
            notes=row.notes,
            showNotes=row.showNotes,
            weightUnit=row.weightUnit,
            sets=[SetModelDB(reps=s.reps, weight=s.weight) for s in row.sets]
        ) for row in updated_table.rows
    ]
    db.commit()
    db.refresh(db_table)
    return db_table_to_schema(db_table)

def import_data(file: UploadFile = File(...), context: str = Form("")):
    """Import workout data from file using AI processing with optional user context"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # Read file content
        content = file.file.read().decode('utf-8', errors='ignore')
        if not content.strip():
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Process with OpenAI to extract bulk workout data, including user context
        workout_list = clean_csv_with_openai(content, context)
        
        # Save to database
        db = SessionLocal()
        try:
            # Ensure we have a list of workouts
            if isinstance(workout_list, dict):
                workout_list = [workout_list]
            elif not isinstance(workout_list, list):
                workout_list = [workout_list]
            
            imported_tables = []
            successful_imports = 0
            
            for i, workout_data in enumerate(workout_list):
                try:
                    # Validate and create table in database
                    validated_workout = TableSchema(**workout_data)
                    db_table = create_db_table_from_schema(validated_workout, db)
                    imported_tables.append({
                        "id": db_table.id,
                        "name": db_table.tableName,
                        "date": db_table.date
                    })
                    successful_imports += 1
                except Exception as e:
                    print(f"Failed to import workout {i+1}: {str(e)}")
                    # Continue with other workouts
                    continue
            
            if successful_imports == 0:
                raise HTTPException(status_code=400, detail="No workouts could be imported from the file")
            
            return {
                "success": True,
                "message": f"Successfully imported {successful_imports} workout session(s) from bulk data",
                "tables": imported_tables,
                "total_found": len(workout_list),
                "successful": successful_imports
            }
            
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

def import_data_simple(file: UploadFile = File(...)):
    """Simple import endpoint that creates a basic workout without using OpenAI"""
    try:
        content = file.file.read().decode('utf-8')
        
        # Create a simple test workout
        simple_workout = {
            "id": f"simple_{hash(content[:50]) % 1000000}",
            "tableName": f"Imported from {file.filename}",
            "date": "2025-01-23",
            "rows": [
                {
                    "id": 1,
                    "muscleGroup": "Test",
                    "exercise": "Sample Exercise",
                    "notes": f"Imported from file: {file.filename}\nOriginal content preview: {content[:100]}",
                    "showNotes": True,
                    "weightUnit": "lbs",
                    "sets": [
                        {"id": None, "reps": "10", "weight": "135"},
                        {"id": None, "reps": "8", "weight": "145"}
                    ]
                }
            ]
        }
        
        db = SessionLocal()
        try:
            insert_table_schema_to_db(simple_workout, db)
            return {
                "message": "Simple import successful", 
                "imported": 1,
                "table_id": simple_workout["id"]
            }
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in simple import: {str(e)}")

def ai_coaching_chat(request: AICoachingRequest, db: Session = Depends(get_db)) -> AICoachingResponse:
    """Main AI coaching chat endpoint"""
    try:
        # Get user workout analytics for context
        user_analytics = analyze_user_workouts(db)
        
        # Enhanced message with user context
        enhanced_message = request.message
        if user_analytics and "error" not in user_analytics:
            context_info = f"\n\nUser Context: {user_analytics['total_workouts']} total workouts, "
            context_info += f"last workout: {user_analytics.get('last_workout', 'unknown')}, "
            context_info += f"frequent exercises: {[ex[0] for ex in user_analytics.get('top_exercises', [])[:3]]}"
            enhanced_message += context_info
        
        # Get AI response
        ai_response = get_ai_coaching_response(
            enhanced_message, 
            request.conversation_history,
            user_analytics
        )
        
        return AICoachingResponse(response=ai_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI coaching error: {str(e)}")

def generate_workout_plan(request: dict, db: Session = Depends(get_db)):
    """Generate a custom workout plan based on user preferences"""
    try:
        # Get user's workout history for context
        user_analytics = analyze_user_workouts(db)
        
        # Generate AI workout plan
        workout_plan = generate_ai_workout_plan(request, user_analytics)
        
        return {
            "workout_plan": workout_plan,
            "parameters": {
                "fitness_level": request.get("fitness_level", "intermediate"),
                "goals": request.get("goals", "general fitness"),
                "duration": request.get("duration", 45),
                "equipment": request.get("equipment", "gym"),
                "focus_areas": request.get("focus_areas", [])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workout generation error: {str(e)}")

def get_exercise_suggestions(request: dict):
    """Get AI-powered exercise suggestions based on muscle group and context"""
    try:
        muscle_group = request.get("muscle_group", "")
        current_exercise = request.get("current_exercise", "")
        context = request.get("context", "general")
        
        suggestions = get_ai_exercise_suggestions(muscle_group, current_exercise, context)
        
        return {
            "suggestions": suggestions,
            "muscle_group": muscle_group,
            "context": context
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exercise suggestion error: {str(e)}")

"""
# README: PUT/POST Endpoints Module

## Overview
This module contains all PUT and POST endpoints for the fitness tracker API. These endpoints 
handle data creation, modification, file imports, and AI-powered features including coaching 
and workout generation.

## Endpoints

### Core Data Operations

#### `POST /tables` - Create New Workout
- **Function**: `create_table(table: TableSchema, db: Session)`
- **Purpose**: Create a new workout session
- **Request Body**: TableSchema - Complete workout data
- **Returns**: TableSchema - Created workout with database IDs
- **Validation**: Prevents duplicate IDs, validates all fields
- **Use Cases**: Manual workout creation, workout template instantiation

#### `PUT /tables/{table_id}` - Update Existing Workout
- **Function**: `update_table(table_id: str, updated_table: TableSchema, db: Session)`
- **Purpose**: Update an existing workout session
- **Parameters**: 
  - `table_id`: Unique identifier for the workout
  - `updated_table`: Complete updated workout data
- **Returns**: TableSchema - Updated workout
- **Features**:
  - Complete replacement of workout data
  - Handles nested relationships (rows, sets)
  - Maintains referential integrity
- **Use Cases**: Workout editing, adding exercises/sets, updating notes

### File Import Operations

#### `POST /import-data` - AI-Powered Import
- **Function**: `import_data(file: UploadFile)`
- **Purpose**: Import workout data from files using AI processing
- **Request**: Multipart form with file upload
- **Supported Formats**: Text files, CSV, any structured workout data
- **Features**:
  - AI parsing of unstructured workout data
  - Multiple workout session detection
  - Bulk import capability
  - Error resilience with partial imports
- **Returns**: Import summary with success/failure counts
- **Use Cases**: Bulk data migration, importing from other fitness apps

#### `POST /import-data-simple` - Simple Import
- **Function**: `import_data_simple(file: UploadFile)`
- **Purpose**: Basic file import without AI processing
- **Features**:
  - Fast processing for simple imports
  - Fallback when AI services unavailable
  - Creates sample workout from file content
- **Use Cases**: Testing, simple file processing, AI service backup

### AI-Powered Features

#### `POST /ai-coaching` - AI Coaching Chat
- **Function**: `ai_coaching_chat(request: AICoachingRequest, db: Session)`
- **Purpose**: Interactive AI fitness coaching conversations
- **Request Body**: AICoachingRequest
  - `message`: User's question or request
  - `conversation_history`: Previous chat messages
  - `user_data`: Optional user context
- **Returns**: AICoachingResponse with AI-generated advice
- **Features**:
  - Context-aware responses using workout history
  - Conversation memory and continuity
  - Personalized advice based on user data
- **Use Cases**: Form guidance, workout planning, nutrition advice, motivation

#### `POST /ai-coaching/generate-workout` - Custom Workout Generation
- **Function**: `generate_workout_plan(request: dict, db: Session)`
- **Purpose**: Generate personalized workout plans
- **Request Parameters**:
  - `fitness_level`: beginner/intermediate/advanced
  - `goals`: muscle gain, fat loss, strength, etc.
  - `duration`: workout length in minutes
  - `equipment`: gym, home, bodyweight, etc.
  - `focus_areas`: specific muscle groups or movement patterns
- **Features**:
  - AI-generated workout structure
  - User history integration
  - Equipment and time constraints
  - Progressive difficulty suggestions
- **Use Cases**: Workout planning, program design, training variation

#### `POST /ai-coaching/exercise-suggestions` - Exercise Recommendations
- **Function**: `get_exercise_suggestions(request: dict)`
- **Purpose**: Get intelligent exercise alternatives and suggestions
- **Request Parameters**:
  - `muscle_group`: target muscle group
  - `current_exercise`: exercise to find alternatives for
  - `context`: training context (progressive_overload, etc.)
- **Features**:
  - Context-aware suggestions
  - Extensive exercise database
  - AI-enhanced recommendations
  - Progressive overload considerations
- **Use Cases**: Exercise variation, equipment substitutions, progression planning

## Data Processing Pipeline

### Workout Creation/Update Flow:
1. **Request Validation**: Pydantic schema validation
2. **Database Check**: Verify constraints and relationships
3. **Transaction**: Create/update with proper relationship handling
4. **Response**: Return updated data with generated IDs

### File Import Flow:
1. **File Upload**: Receive and validate file
2. **Content Processing**: AI or rule-based parsing
3. **Data Structuring**: Convert to workout table format
4. **Validation**: Schema validation for each workout
5. **Database Insert**: Bulk insert with error handling
6. **Response**: Import summary with statistics

### AI Processing Flow:
1. **Context Building**: Gather user workout history
2. **Prompt Construction**: Build AI prompt with context
3. **AI API Call**: Send request to OpenAI
4. **Response Processing**: Parse and validate AI response
5. **Fallback Handling**: Rule-based alternatives if AI fails

## Error Handling

### HTTP Status Codes:
- **400 Bad Request**: Invalid data, duplicate IDs, empty files
- **404 Not Found**: Workout not found for updates
- **500 Internal Server Error**: Database errors, AI service failures

### Validation:
- **Pydantic Validation**: Automatic request/response validation
- **Database Constraints**: Foreign key and uniqueness validation
- **File Validation**: Content and format checks

### Resilience Features:
- **Partial Import Success**: Continue processing despite individual failures
- **AI Fallbacks**: Rule-based alternatives when AI unavailable
- **Transaction Safety**: Database rollback on errors

## Performance Considerations

### Optimization Features:
- **Bulk Operations**: Efficient batch processing for imports
- **Connection Pooling**: Database connection management
- **AI Rate Limiting**: Managed OpenAI API usage
- **Memory Management**: Efficient file processing

### Scalability:
- **Session Management**: Proper database session lifecycle
- **Error Isolation**: Individual operation failures don't affect others
- **Resource Cleanup**: Temporary file cleanup

## Dependencies

### Required Modules:
- **FastAPI**: HTTP handling, file uploads, dependency injection
- **SQLAlchemy**: Database ORM and transaction management
- **Pydantic**: Data validation and serialization
- **OpenAI**: AI service integration
- **Custom modules**: schemas, models, db, ai

## Usage Examples

### Create workout:
```python
from put_post_endpoints import create_table
from schemas import TableSchema

workout = TableSchema(
    id="workout_123",
    tableName="Push Day",
    date="2025-01-26",
    rows=[...]
)
result = create_table(workout, db)
```

### AI coaching:
```python
from put_post_endpoints import ai_coaching_chat
from schemas import AICoachingRequest

request = AICoachingRequest(
    message="What's a good chest workout?",
    conversation_history=[]
)
response = ai_coaching_chat(request, db)
```

### Import data:
```python
from put_post_endpoints import import_data

# File upload handling in FastAPI
result = import_data(uploaded_file)
```

## Integration Points

### Frontend Integration:
- Form submissions use POST/PUT endpoints
- File upload components integrate with import endpoints
- Chat interfaces use AI coaching endpoints
- Workout builders use exercise suggestion endpoints

### API Routes:
These functions are mapped to FastAPI routes in main.py:
```python
app.post("/tables", response_model=TableSchema)(create_table)
app.put("/tables/{table_id}", response_model=TableSchema)(update_table)
app.post("/import-data")(import_data)
app.post("/ai-coaching", response_model=AICoachingResponse)(ai_coaching_chat)
```
"""