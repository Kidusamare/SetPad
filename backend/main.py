from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, Table as TableModelDB, Row as RowModelDB, Set as SetModelDB
import pandas as pd 
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get OpenAI API key from environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # More secure CORS
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Schemas ---
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

# --- Helper Functions ---
def db_table_to_schema(table: TableModelDB) -> TableSchema:
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

def save_uploaded_file_to_temp(upload_file: UploadFile) -> str:
    """
    Save the uploaded file to a temp file and return the path.
    """
    import os
    import tempfile
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, upload_file.filename)
    with open(temp_path, "wb") as f:
        f.write(upload_file.file.read())
    return temp_path

# Helper to call OpenAI ChatGPT 3.5 to clean up CSV data
import openai

client = openai.OpenAI(api_key=openai_api_key)

def clean_csv_with_openai(raw_text: str) -> list:
    """Enhanced OpenAI processing for bulk workout data imports"""
    from datetime import datetime
    import json
    
    prompt = f"""You are a fitness data processor. Convert this bulk workout data into a JSON array of workout sessions. 

Each workout session should be a separate table with this EXACT structure:

[
  {{
    "id": "workout_YYYYMMDD_session1",
    "tableName": "Descriptive Workout Name",
    "date": "YYYY-MM-DD",
    "rows": [
      {{
        "muscleGroup": "muscle_group_name",
        "exercise": "exercise_name", 
        "notes": "",
        "showNotes": false,
        "weightUnit": "lbs",
        "sets": [
          {{"reps": "number", "weight": "number"}},
          {{"reps": "number", "weight": "number"}}
        ]
      }}
    ]
  }},
  {{
    "id": "workout_YYYYMMDD_session2", 
    "tableName": "Another Workout Name",
    "date": "YYYY-MM-DD",
    "rows": [...]
  }}
]

IMPORTANT RULES:
1. Create separate workout sessions for different dates/times
2. Group exercises by workout session, not individual exercises
3. If dates aren't clear, use sequential dates starting from today
4. Each session should have a unique ID and descriptive name
5. Return ONLY the JSON array, no explanations or markdown

BULK WORKOUT DATA:
{raw_text[:2500]}"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,
            temperature=0.1,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Clean up markdown formatting
        content = content.replace('```json', '').replace('```', '').strip()
        
        # Try to parse JSON
        try:
            parsed_data = json.loads(content)
            # Ensure we have an array of workouts
            if isinstance(parsed_data, list) and len(parsed_data) > 0:
                return parsed_data
            elif isinstance(parsed_data, dict):
                # Single workout, wrap in array
                return [parsed_data]
        except json.JSONDecodeError:
            pass
        
        # Fallback: create multiple workouts from the raw data
        return create_bulk_workouts_from_text(raw_text)
        
    except Exception as e:
        # Create bulk workouts as fallback
        return create_bulk_workouts_from_text(raw_text, error=str(e))

def create_bulk_workouts_from_text(text: str, error: str = None) -> list:
    """Create multiple workout structures from bulk text input"""
    from datetime import datetime, timedelta
    import re
    
    # Try to split text into multiple workout sessions
    # Look for common separators like dates, "workout", "session", etc.
    session_indicators = [
        r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # Dates
        r'workout\s+\d+',  # "Workout 1", "Workout 2"
        r'session\s+\d+',  # "Session 1", "Session 2" 
        r'day\s+\d+',      # "Day 1", "Day 2"
        r'week\s+\d+',     # "Week 1", "Week 2"
    ]
    
    # Split text by potential session indicators
    sessions = []
    current_session = text
    
    for pattern in session_indicators:
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        if len(matches) > 1:
            # Found multiple sessions
            sessions = []
            start = 0
            for i, match in enumerate(matches):
                if i > 0:  # Skip first match as it's the start
                    session_text = text[start:match.start()].strip()
                    if session_text:
                        sessions.append(session_text)
                start = match.start()
            # Add final session
            final_session = text[start:].strip()
            if final_session:
                sessions.append(final_session)
            break
    
    # If no clear sessions found, split by paragraphs or significant breaks
    if not sessions:
        # Split by double newlines or large chunks
        potential_sessions = re.split(r'\n\s*\n|\n{3,}', text)
        sessions = [s.strip() for s in potential_sessions if len(s.strip()) > 50]
    
    # If still no sessions, treat as single workout but try to break into exercises
    if not sessions:
        sessions = [text]
    
    # Create workout structures
    workouts = []
    base_date = datetime.now()
    
    for i, session_text in enumerate(sessions[:10]):  # Limit to 10 sessions max
        # Extract numbers for this session
        numbers = re.findall(r'\d+', session_text)
        
        # Try to identify exercises in this session
        exercise_lines = []
        lines = session_text.split('\n')
        for line in lines:
            line = line.strip()
            if line and (any(word in line.lower() for word in ['press', 'squat', 'curl', 'row', 'pull', 'push', 'lift', 'raise', 'extension', 'fly']) or re.search(r'\d+.*x.*\d+', line)):
                exercise_lines.append(line)
        
        # Create workout structure
        workout = {
            "id": f"bulk_import_{i+1}_{hash(session_text[:30]) % 100000}",
            "tableName": f"Imported Session {i+1}" if not error else f"Import Session {i+1} (Issues)",
            "date": (base_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            "rows": []
        }
        
        # Create exercises from identified lines
        if exercise_lines:
            for j, exercise_line in enumerate(exercise_lines[:8]):  # Max 8 exercises per session
                # Extract exercise name
                exercise_name = re.sub(r'\d+.*', '', exercise_line).strip()
                if not exercise_name:
                    exercise_name = f"Exercise {j+1}"
                
                # Extract sets from this line
                sets = []
                line_numbers = re.findall(r'\d+', exercise_line)
                if len(line_numbers) >= 2:
                    # Pair numbers as reps/weight
                    for k in range(0, min(len(line_numbers), 6), 2):
                        if k+1 < len(line_numbers):
                            sets.append({
                                "reps": line_numbers[k],
                                "weight": line_numbers[k+1]
                            })
                
                if not sets:
                    sets = [{"reps": "1", "weight": "0"}]
                
                workout["rows"].append({
                    "muscleGroup": "General",
                    "exercise": exercise_name[:50],  # Limit length
                    "notes": f"From: {exercise_line[:100]}" + (f"\nError: {error}" if error else ""),
                    "showNotes": True,
                    "weightUnit": "lbs",
                    "sets": sets
                })
        else:
            # No clear exercises found, create a general one with available numbers
            sets = []
            if len(numbers) >= 2:
                for k in range(0, min(len(numbers), 6), 2):
                    if k+1 < len(numbers):
                        sets.append({
                            "reps": numbers[k],
                            "weight": numbers[k+1]
                        })
            
            if not sets:
                sets = [{"reps": "1", "weight": "0"}]
            
            workout["rows"].append({
                "muscleGroup": "General",
                "exercise": "Imported Exercise",
                "notes": f"Session data: {session_text[:200]}{'...' if len(session_text) > 200 else ''}" + (f"\nError: {error}" if error else ""),
                "showNotes": True,
                "weightUnit": "lbs",
                "sets": sets
            })
        
        workouts.append(workout)
    
    return workouts if workouts else [create_single_fallback_workout(text, error)]

def create_single_fallback_workout(text: str, error: str = None) -> dict:
    """Create a single basic workout as final fallback"""
    from datetime import datetime
    import re
    
    numbers = re.findall(r'\d+', text)
    sets = []
    
    if len(numbers) >= 2:
        for i in range(0, min(len(numbers), 6), 2):
            if i+1 < len(numbers):
                sets.append({
                    "reps": numbers[i],
                    "weight": numbers[i+1]
                })
    
    if not sets:
        sets = [{"reps": "1", "weight": "0"}]
    
    return {
        "id": f"fallback_{hash(text[:50]) % 1000000}",
        "tableName": "Imported Workout" if not error else "Import with Issues",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "rows": [
            {
                "muscleGroup": "General",
                "exercise": "Imported Exercise",
                "notes": f"Original: {text[:200]}{'...' if len(text) > 200 else ''}" + (f"\nError: {error}" if error else ""),
                "showNotes": True,
                "weightUnit": "lbs",
                "sets": sets
            }
        ]
    }

def insert_table_schema_to_db(table_schema: dict, db: Session):
    # Convert dict to TableSchema for validation
    from pydantic import ValidationError
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

# --- Endpoints ---
@app.get("/tables", response_model=List[TableSchema])
def get_tables(db: Session = Depends(get_db)):
    tables = db.query(TableModelDB).all()
    # Sort by date descending (latest first)
    tables_sorted = sorted(tables, key=lambda t: t.date, reverse=True)
    return [db_table_to_schema(t) for t in tables_sorted]

@app.get("/tables/{table_id}", response_model=TableSchema)
def get_table(table_id: str, db: Session = Depends(get_db)):
    table = db.query(TableModelDB).filter(TableModelDB.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return db_table_to_schema(table)

@app.post("/tables", response_model=TableSchema)
def create_table(table: TableSchema, db: Session = Depends(get_db)):
    if db.query(TableModelDB).filter(TableModelDB.id == table.id).first():
        raise HTTPException(status_code=400, detail="Table with this ID already exists")
    db_table = create_db_table_from_schema(table, db)
    return db_table_to_schema(db_table)

@app.put("/tables/{table_id}", response_model=TableSchema)
def update_table(table_id: str, updated_table: TableSchema, db: Session = Depends(get_db)):
    db_table = db.query(TableModelDB).filter(TableModelDB.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
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

@app.delete("/tables/{table_id}")
def delete_table(table_id: str, db: Session = Depends(get_db)):
    db_table = db.query(TableModelDB).filter(TableModelDB.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
    db.delete(db_table)
    db.commit()
    return {"success": True}

@app.post("/import-data")
def import_data(file: UploadFile = File(...)):
    """Simplified import that processes file with OpenAI and creates workout tables"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # Read file content
        content = file.file.read().decode('utf-8', errors='ignore')
        if not content.strip():
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Process with OpenAI to extract bulk workout data
        workout_list = clean_csv_with_openai(content)
        
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

@app.post("/import-data-simple")
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

# --- AI Coaching Schemas ---
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

# --- AI Coaching Functions ---
def get_ai_coaching_response(message: str, history: List[MessageSchema], user_data: Dict = None) -> str:
    """Generate AI coaching response using OpenAI"""
    try:
        # Build context from conversation history
        context_messages = []
        
        # System prompt for AI coaching
        system_prompt = """You are an expert AI fitness coach with deep knowledge in:
- Workout planning and programming
- Exercise form and technique
- Nutrition and meal planning
- Injury prevention and recovery
- Goal setting and motivation
- Progress tracking and analytics

Personality:
- Supportive and encouraging
- Professional but friendly
- Practical and actionable advice
- Personalized recommendations
- Evidence-based information

Guidelines:
- Keep responses conversational and engaging
- Provide specific, actionable advice
- Ask follow-up questions when appropriate
- Reference previous conversation when relevant
- Encourage consistency and gradual progress
- Always prioritize safety and proper form
- Suggest modifications for different fitness levels"""

        context_messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history
        for msg in history[-5:]:  # Last 5 messages for context
            role = "assistant" if msg.type == "ai" else "user"
            context_messages.append({"role": role, "content": msg.content})
        
        # Add current message
        context_messages.append({"role": "user", "content": message})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=context_messages,
            max_tokens=800,
            temperature=0.7,
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"I'm having trouble connecting right now. Please make sure I'm properly configured and try again. Technical details: {str(e)}"

def analyze_user_workouts(db: Session) -> Dict[str, Any]:
    """Analyze user's workout data for personalized coaching"""
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

# --- AI Coaching Endpoints ---
@app.post("/ai-coaching", response_model=AICoachingResponse)
def ai_coaching_chat(request: AICoachingRequest, db: Session = Depends(get_db)):
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

@app.get("/ai-coaching/workout-analysis")
def get_workout_analysis(db: Session = Depends(get_db)):
    """Get AI analysis of user's workout patterns"""
    try:
        analytics = analyze_user_workouts(db)
        
        if "error" in analytics:
            raise HTTPException(status_code=500, detail=analytics["error"])
        
        # Generate AI insights
        insight_prompt = f"""Based on this workout data, provide 3-4 key insights and recommendations:
        
Total workouts: {analytics.get('total_workouts', 0)}
Recent workouts: {analytics.get('recent_workouts', 0)}
Top exercises: {analytics.get('top_exercises', [])}
Top muscle groups: {analytics.get('top_muscle_groups', [])}
Last workout: {analytics.get('last_workout', 'Unknown')}

Provide specific, actionable insights about:
1. Training frequency and consistency
2. Exercise variety and balance
3. Muscle group focus
4. Recommendations for improvement

Keep it concise and encouraging."""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": insight_prompt}],
                max_tokens=400,
                temperature=0.6,
            )
            
            ai_insights = response.choices[0].message.content.strip()
            
        except Exception:
            ai_insights = "Unable to generate AI insights at this time."
        
        return {
            "analytics": analytics,
            "ai_insights": ai_insights
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.post("/ai-coaching/generate-workout")
def generate_workout_plan(request: dict, db: Session = Depends(get_db)):
    """Generate a custom workout plan based on user preferences"""
    try:
        # Extract parameters
        fitness_level = request.get("fitness_level", "intermediate")
        goals = request.get("goals", "general fitness")
        duration = request.get("duration", 45)
        equipment = request.get("equipment", "gym")
        focus_areas = request.get("focus_areas", [])
        
        # Get user's workout history for context
        user_analytics = analyze_user_workouts(db)
        
        # Create workout generation prompt
        workout_prompt = f"""Create a detailed workout plan with these specifications:

Fitness Level: {fitness_level}
Goals: {goals}
Duration: {duration} minutes
Equipment: {equipment}
Focus Areas: {', '.join(focus_areas) if focus_areas else 'Full body'}

User's Training History:
- Total workouts logged: {user_analytics.get('total_workouts', 0)}
- Frequent exercises: {[ex[0] for ex in user_analytics.get('top_exercises', [])][:5]}
- Muscle groups trained: {[mg[0] for mg in user_analytics.get('top_muscle_groups', [])][:5]}

Please create a structured workout plan with:
1. Warm-up (5-10 minutes)
2. Main workout (exercises with sets/reps/rest)
3. Cool-down (5-10 minutes)
4. Tips and modifications

Format each exercise as: Exercise Name - Sets x Reps (Rest time)
Include progression tips and safety notes."""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": workout_prompt}],
                max_tokens=1000,
                temperature=0.7,
            )
            
            workout_plan = response.choices[0].message.content.strip()
            
        except Exception as e:
            workout_plan = f"Sorry, I couldn't generate a workout plan right now. Error: {str(e)}"
        
        return {
            "workout_plan": workout_plan,
            "parameters": {
                "fitness_level": fitness_level,
                "goals": goals,
                "duration": duration,
                "equipment": equipment,
                "focus_areas": focus_areas
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workout generation error: {str(e)}")

@app.post("/ai-coaching/exercise-suggestions")
def get_exercise_suggestions(request: dict):
    """Get AI-powered exercise suggestions based on muscle group and context"""
    try:
        muscle_group = request.get("muscle_group", "")
        current_exercise = request.get("current_exercise", "")
        context = request.get("context", "general")
        
        # Exercise database for smart suggestions
        exercise_database = {
            "Chest": [
                "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Press",
                "Incline Dumbbell Press", "Dumbbell Flyes", "Incline Flyes", "Cable Flyes",
                "Push-ups", "Dips", "Chest Press Machine", "Pec Deck", "Cable Crossover"
            ],
            "Back": [
                "Deadlift", "Pull-ups", "Chin-ups", "Barbell Rows", "Dumbbell Rows",
                "T-Bar Rows", "Cable Rows", "Lat Pulldowns", "Face Pulls", "Reverse Flyes",
                "Hyperextensions", "Good Mornings", "Shrugs"
            ],
            "Shoulders": [
                "Overhead Press", "Military Press", "Dumbbell Press", "Arnold Press",
                "Lateral Raises", "Front Raises", "Rear Delt Flyes", "Upright Rows",
                "Pike Push-ups", "Handstand Push-ups", "Cable Lateral Raises"
            ],
            "Legs": [
                "Squat", "Front Squat", "Leg Press", "Lunges", "Bulgarian Split Squats",
                "Romanian Deadlift", "Leg Curls", "Leg Extensions", "Calf Raises",
                "Walking Lunges", "Step-ups", "Wall Sits", "Single Leg Deadlifts"
            ],
            "Biceps": [
                "Barbell Curls", "Dumbbell Curls", "Hammer Curls", "Cable Curls",
                "Preacher Curls", "Concentration Curls", "21s", "Chin-ups"
            ],
            "Triceps": [
                "Close-Grip Bench Press", "Tricep Dips", "Overhead Tricep Extension",
                "Tricep Pushdowns", "Diamond Push-ups", "Skull Crushers", "French Press"
            ],
            "Abs": [
                "Plank", "Crunches", "Bicycle Crunches", "Russian Twists", "Mountain Climbers",
                "Hanging Leg Raises", "Ab Wheel", "Dead Bug", "Hollow Body Hold"
            ],
            "Glutes": [
                "Hip Thrusts", "Glute Bridges", "Romanian Deadlift", "Bulgarian Split Squats",
                "Clamshells", "Monster Walks", "Fire Hydrants", "Glute Ham Raise"
            ],
            "Calves": [
                "Calf Raises", "Seated Calf Raises", "Donkey Calf Raises", "Jump Rope",
                "Box Jumps", "Single Leg Calf Raises"
            ]
        }
        
        # Get base suggestions from database
        base_exercises = exercise_database.get(muscle_group, [])
        
        # Filter out current exercise and get related exercises
        suggestions = [ex for ex in base_exercises if ex.lower() != current_exercise.lower()]
        
        # Use AI to enhance suggestions based on context
        if context == "progressive_overload" and muscle_group and len(suggestions) > 0:
            try:
                ai_prompt = f"""Given the muscle group "{muscle_group}" and current exercise "{current_exercise}", 
suggest 3-4 complementary exercises that would work well for progressive overload training.

Consider:
- Compound vs isolation movements
- Different angles and grips
- Progressive difficulty
- Synergistic muscle activation

Available exercises: {', '.join(suggestions[:10])}

Return only the exercise names, one per line."""

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": ai_prompt}],
                    max_tokens=200,
                    temperature=0.7,
                )
                
                ai_suggestions = response.choices[0].message.content.strip().split('\n')
                ai_suggestions = [s.strip() for s in ai_suggestions if s.strip()]
                
                # Prioritize AI suggestions, fall back to database
                filtered_ai = [s for s in ai_suggestions if s in base_exercises]
                suggestions = filtered_ai + [s for s in suggestions if s not in filtered_ai]
                
            except Exception as ai_error:
                print(f"AI suggestion error: {ai_error}")
                # Fall back to database suggestions
                pass
        
        return {
            "suggestions": suggestions[:6],  # Return top 6 suggestions
            "muscle_group": muscle_group,
            "context": context
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exercise suggestion error: {str(e)}")


