import openai
import os
import json
import re
import tempfile
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import UploadFile
from dotenv import load_dotenv
from schemas import MessageSchema
from db import analyze_user_workouts

load_dotenv()

# Get OpenAI API key from environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

client = openai.OpenAI(api_key=openai_api_key)

def save_uploaded_file_to_temp(upload_file: UploadFile) -> str:
    """Save the uploaded file to a temp file and return the path"""
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, upload_file.filename)
    with open(temp_path, "wb") as f:
        f.write(upload_file.file.read())
    return temp_path

def clean_csv_with_openai(raw_text: str) -> list:
    """Enhanced OpenAI processing for bulk workout data imports"""
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

def generate_ai_workout_analysis(analytics: dict) -> str:
    """Generate AI insights from workout analytics"""
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
        
        return response.choices[0].message.content.strip()
        
    except Exception:
        return "Unable to generate AI insights at this time."

def generate_ai_workout_plan(request: dict, user_analytics: dict) -> str:
    """Generate a custom workout plan based on user preferences"""
    # Extract parameters
    fitness_level = request.get("fitness_level", "intermediate")
    goals = request.get("goals", "general fitness")
    duration = request.get("duration", 45)
    equipment = request.get("equipment", "gym")
    focus_areas = request.get("focus_areas", [])
    
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
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"Sorry, I couldn't generate a workout plan right now. Error: {str(e)}"

def get_ai_exercise_suggestions(muscle_group: str, current_exercise: str, context: str) -> list:
    """Get AI-powered exercise suggestions based on muscle group and context"""
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
    
    return suggestions[:6]  # Return top 6 suggestions

"""
# README: AI Functions Module

## Overview
This module contains all OpenAI API integrations and AI-powered features for the fitness 
tracker application. It handles workout data processing, AI coaching, exercise suggestions, 
and workout plan generation using GPT-3.5-turbo.

## Key Features

### Data Import & Processing
- **clean_csv_with_openai(raw_text: str)**: Processes bulk workout data using AI
  - Converts unstructured text to JSON workout sessions
  - Handles multiple workout formats and styles
  - Creates properly structured workout tables

- **create_bulk_workouts_from_text(text: str)**: Fallback processor for bulk imports
  - Extracts exercises and sets from raw text
  - Handles edge cases and errors gracefully
  - Creates multiple workout sessions from single text block

- **save_uploaded_file_to_temp(upload_file: UploadFile)**: File handling utility
  - Saves uploaded files to temporary directory
  - Used for CSV/text file imports

### AI Coaching System
- **get_ai_coaching_response(message: str, history: List[MessageSchema])**: Main coaching AI
  - Provides personalized fitness advice and guidance
  - Maintains conversation context and history
  - Includes comprehensive fitness knowledge base

- **generate_ai_workout_analysis(analytics: dict)**: Workout pattern analysis
  - Analyzes user's training patterns and consistency
  - Provides insights on exercise variety and muscle group balance
  - Generates actionable recommendations for improvement

- **generate_ai_workout_plan(request: dict, user_analytics: dict)**: Custom workout generation
  - Creates personalized workout plans based on goals and preferences
  - Considers user's fitness level, available equipment, and time constraints
  - Incorporates user's training history for personalized recommendations

### Exercise Suggestions
- **get_ai_exercise_suggestions(muscle_group: str, current_exercise: str, context: str)**: Smart exercise recommendations
  - Provides context-aware exercise alternatives
  - Uses extensive exercise database with AI enhancement
  - Considers progressive overload and training variety

## AI Models & Configuration
- **Primary Model**: GPT-3.5-turbo for all AI operations
- **Temperature Settings**: Optimized for different use cases (0.1-0.7)
- **Token Limits**: Configured per function based on expected output length
- **Fallback Handling**: Robust error handling with non-AI alternatives

## Exercise Database
Comprehensive exercise database organized by muscle groups:
- **Chest**: 13 exercises (Bench Press, Flyes, Push-ups, etc.)
- **Back**: 13 exercises (Deadlifts, Pull-ups, Rows, etc.)
- **Shoulders**: 11 exercises (Presses, Raises, etc.)
- **Legs**: 13 exercises (Squats, Lunges, etc.)
- **Arms**: Biceps (8) and Triceps (7) exercises
- **Core**: Abs (9) exercises
- **Glutes**: 8 specialized exercises
- **Calves**: 6 exercises

## Usage Examples

### AI Coaching:
```python
from ai import get_ai_coaching_response
from schemas import MessageSchema

history = [MessageSchema(type="user", content="Hi!")]
response = get_ai_coaching_response("What's a good chest workout?", history)
```

### Workout Plan Generation:
```python
from ai import generate_ai_workout_plan

request = {
    "fitness_level": "intermediate",
    "goals": "muscle gain",
    "duration": 60,
    "equipment": "gym"
}
plan = generate_ai_workout_plan(request, user_analytics)
```

### Data Import:
```python
from ai import clean_csv_with_openai

with open("workout_data.txt", "r") as f:
    text = f.read()
workouts = clean_csv_with_openai(text)
```

## Error Handling
- All AI functions include comprehensive error handling
- Fallback mechanisms for when AI services are unavailable
- Graceful degradation to rule-based alternatives
- User-friendly error messages for debugging

## Dependencies
- OpenAI Python client library
- python-dotenv for API key management
- FastAPI for file upload handling
- Pydantic schemas for data validation
"""