#!/usr/bin/env python3
"""
Script to populate the fitness tracker database with 20 days of realistic bodybuilding workout data.
This creates a structured 5-day split routine repeated over 4 weeks.
"""

import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the current directory to Python path to import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Base, Table as TableModelDB, Row as RowModelDB, Set as SetModelDB

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bodybuilding 5-day split program
WORKOUT_SPLIT = {
    "Day 1": {
        "name": "Chest & Triceps",
        "exercises": [
            {"muscle": "Chest", "exercise": "Bench Press", "sets": [{"reps": "8", "weight": "225"}, {"reps": "8", "weight": "225"}, {"reps": "6", "weight": "235"}, {"reps": "6", "weight": "235"}]},
            {"muscle": "Chest", "exercise": "Incline Dumbbell Press", "sets": [{"reps": "10", "weight": "80"}, {"reps": "10", "weight": "80"}, {"reps": "8", "weight": "85"}, {"reps": "8", "weight": "85"}]},
            {"muscle": "Chest", "exercise": "Decline Barbell Press", "sets": [{"reps": "10", "weight": "185"}, {"reps": "10", "weight": "185"}, {"reps": "8", "weight": "195"}]},
            {"muscle": "Chest", "exercise": "Dumbbell Flyes", "sets": [{"reps": "12", "weight": "35"}, {"reps": "12", "weight": "35"}, {"reps": "10", "weight": "40"}]},
            {"muscle": "Triceps", "exercise": "Close-Grip Bench Press", "sets": [{"reps": "10", "weight": "155"}, {"reps": "10", "weight": "155"}, {"reps": "8", "weight": "165"}]},
            {"muscle": "Triceps", "exercise": "Tricep Dips", "sets": [{"reps": "12", "weight": "45"}, {"reps": "10", "weight": "45"}, {"reps": "8", "weight": "45"}]},
            {"muscle": "Triceps", "exercise": "Overhead Tricep Extension", "sets": [{"reps": "12", "weight": "60"}, {"reps": "12", "weight": "60"}, {"reps": "10", "weight": "65"}]}
        ]
    },
    "Day 2": {
        "name": "Back & Biceps",
        "exercises": [
            {"muscle": "Back", "exercise": "Deadlift", "sets": [{"reps": "6", "weight": "315"}, {"reps": "6", "weight": "315"}, {"reps": "4", "weight": "335"}, {"reps": "4", "weight": "335"}]},
            {"muscle": "Back", "exercise": "Pull-ups", "sets": [{"reps": "10", "weight": "25"}, {"reps": "8", "weight": "25"}, {"reps": "6", "weight": "35"}]},
            {"muscle": "Back", "exercise": "Barbell Rows", "sets": [{"reps": "10", "weight": "185"}, {"reps": "10", "weight": "185"}, {"reps": "8", "weight": "195"}]},
            {"muscle": "Back", "exercise": "Lat Pulldowns", "sets": [{"reps": "12", "weight": "150"}, {"reps": "10", "weight": "160"}, {"reps": "8", "weight": "170"}]},
            {"muscle": "Biceps", "exercise": "Barbell Curls", "sets": [{"reps": "10", "weight": "95"}, {"reps": "8", "weight": "105"}, {"reps": "6", "weight": "115"}]},
            {"muscle": "Biceps", "exercise": "Hammer Curls", "sets": [{"reps": "12", "weight": "40"}, {"reps": "10", "weight": "45"}, {"reps": "8", "weight": "50"}]},
            {"muscle": "Biceps", "exercise": "Cable Curls", "sets": [{"reps": "15", "weight": "70"}, {"reps": "12", "weight": "80"}, {"reps": "10", "weight": "90"}]}
        ]
    },
    "Day 3": {
        "name": "Shoulders & Abs",
        "exercises": [
            {"muscle": "Shoulders", "exercise": "Overhead Press", "sets": [{"reps": "8", "weight": "135"}, {"reps": "8", "weight": "135"}, {"reps": "6", "weight": "145"}, {"reps": "6", "weight": "145"}]},
            {"muscle": "Shoulders", "exercise": "Lateral Raises", "sets": [{"reps": "15", "weight": "25"}, {"reps": "12", "weight": "30"}, {"reps": "10", "weight": "35"}]},
            {"muscle": "Shoulders", "exercise": "Rear Delt Flyes", "sets": [{"reps": "15", "weight": "20"}, {"reps": "15", "weight": "20"}, {"reps": "12", "weight": "25"}]},
            {"muscle": "Shoulders", "exercise": "Upright Rows", "sets": [{"reps": "12", "weight": "85"}, {"reps": "10", "weight": "95"}, {"reps": "8", "weight": "105"}]},
            {"muscle": "Abs", "exercise": "Hanging Leg Raises", "sets": [{"reps": "15", "weight": "0"}, {"reps": "12", "weight": "0"}, {"reps": "10", "weight": "0"}]},
            {"muscle": "Abs", "exercise": "Russian Twists", "sets": [{"reps": "20", "weight": "25"}, {"reps": "20", "weight": "25"}, {"reps": "15", "weight": "35"}]},
            {"muscle": "Abs", "exercise": "Plank Hold", "sets": [{"reps": "60", "weight": "0"}, {"reps": "45", "weight": "0"}, {"reps": "30", "weight": "0"}]}
        ]
    },
    "Day 4": {
        "name": "Legs (Quads Focus)",
        "exercises": [
            {"muscle": "Legs", "exercise": "Squat", "sets": [{"reps": "8", "weight": "275"}, {"reps": "8", "weight": "275"}, {"reps": "6", "weight": "295"}, {"reps": "6", "weight": "295"}]},
            {"muscle": "Legs", "exercise": "Leg Press", "sets": [{"reps": "15", "weight": "450"}, {"reps": "12", "weight": "500"}, {"reps": "10", "weight": "550"}]},
            {"muscle": "Legs", "exercise": "Bulgarian Split Squats", "sets": [{"reps": "12", "weight": "60"}, {"reps": "10", "weight": "70"}, {"reps": "8", "weight": "80"}]},
            {"muscle": "Legs", "exercise": "Leg Extensions", "sets": [{"reps": "15", "weight": "140"}, {"reps": "12", "weight": "150"}, {"reps": "10", "weight": "160"}]},
            {"muscle": "Calves", "exercise": "Calf Raises", "sets": [{"reps": "20", "weight": "225"}, {"reps": "15", "weight": "245"}, {"reps": "12", "weight": "265"}]},
            {"muscle": "Legs", "exercise": "Walking Lunges", "sets": [{"reps": "20", "weight": "50"}, {"reps": "16", "weight": "60"}, {"reps": "12", "weight": "70"}]}
        ]
    },
    "Day 5": {
        "name": "Legs (Hamstrings & Glutes)",
        "exercises": [
            {"muscle": "Legs", "exercise": "Romanian Deadlift", "sets": [{"reps": "10", "weight": "225"}, {"reps": "8", "weight": "245"}, {"reps": "6", "weight": "265"}, {"reps": "6", "weight": "265"}]},
            {"muscle": "Legs", "exercise": "Leg Curls", "sets": [{"reps": "12", "weight": "120"}, {"reps": "10", "weight": "130"}, {"reps": "8", "weight": "140"}]},
            {"muscle": "Glutes", "exercise": "Hip Thrusts", "sets": [{"reps": "15", "weight": "185"}, {"reps": "12", "weight": "205"}, {"reps": "10", "weight": "225"}]},
            {"muscle": "Legs", "exercise": "Stiff Leg Deadlifts", "sets": [{"reps": "12", "weight": "155"}, {"reps": "10", "weight": "175"}, {"reps": "8", "weight": "185"}]},
            {"muscle": "Glutes", "exercise": "Glute Bridges", "sets": [{"reps": "20", "weight": "135"}, {"reps": "15", "weight": "155"}, {"reps": "12", "weight": "175"}]},
            {"muscle": "Calves", "exercise": "Seated Calf Raises", "sets": [{"reps": "20", "weight": "90"}, {"reps": "15", "weight": "100"}, {"reps": "12", "weight": "110"}]}
        ]
    }
}

def clear_database():
    """Clear all existing workout data from the database"""
    print("Clearing existing database...")
    db = SessionLocal()
    try:
        # Delete all tables (this will cascade to rows and sets)
        db.query(TableModelDB).delete()
        db.commit()
        print("Database cleared successfully!")
    except Exception as e:
        print(f"Error clearing database: {e}")
        db.rollback()
    finally:
        db.close()

def add_progression(week_num, base_sets):
    """Add progressive overload based on the week number"""
    progressed_sets = []
    for set_data in base_sets:
        new_set = set_data.copy()
        if week_num > 1:
            # Increase weight by 2.5-5 lbs per week for most exercises
            current_weight = int(set_data["weight"])
            if current_weight > 0:  # Don't modify bodyweight exercises
                weight_increase = 5 if current_weight > 100 else 2.5
                new_weight = current_weight + (weight_increase * (week_num - 1))
                new_set["weight"] = str(int(new_weight))
        progressed_sets.append(new_set)
    return progressed_sets

def populate_bodybuilding_data():
    """Populate database with 20 days of bodybuilding workout data (4 weeks)"""
    print("Populating database with bodybuilding workout data...")
    
    db = SessionLocal()
    try:
        # Create 4 weeks of workouts (20 days total)
        start_date = datetime.now() - timedelta(days=25)  # Start 25 days ago
        workout_days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]
        
        workout_count = 0
        for week in range(1, 5):  # 4 weeks
            print(f"Creating Week {week} workouts...")
            
            for day_index, day_name in enumerate(workout_days):
                workout_count += 1
                if workout_count > 20:  # Limit to 20 workouts
                    break
                
                # Calculate date for this workout
                workout_date = start_date + timedelta(days=(week-1)*7 + day_index)
                
                # Get workout template and add progression
                workout_template = WORKOUT_SPLIT[day_name]
                
                # Create table entry
                table_id = f"bodybuilding_w{week}d{day_index+1}_{workout_date.strftime('%Y%m%d')}"
                table_name = f"Week {week} - {workout_template['name']}"
                
                # Create workout rows with exercises
                workout_rows = []
                for exercise_data in workout_template["exercises"]:
                    # Add progression to sets
                    progressed_sets = add_progression(week, exercise_data["sets"])
                    
                    # Create sets for this exercise
                    exercise_sets = [
                        SetModelDB(reps=set_data["reps"], weight=set_data["weight"])
                        for set_data in progressed_sets
                    ]
                    
                    # Create exercise row
                    workout_rows.append(RowModelDB(
                        muscleGroup=exercise_data["muscle"],
                        exercise=exercise_data["exercise"],
                        notes=f"Week {week} progression - Focus on form and controlled movements",
                        showNotes=False,
                        weightUnit="lbs",
                        sets=exercise_sets
                    ))
                
                # Create table
                db_table = TableModelDB(
                    id=table_id,
                    tableName=table_name,
                    date=workout_date.strftime("%Y-%m-%d"),
                    rows=workout_rows
                )
                
                db.add(db_table)
                print(f"Added: {table_name} ({workout_date.strftime('%Y-%m-%d')})")
        
        db.commit()
        print(f"Successfully populated database with {workout_count} bodybuilding workouts!")
        print("Data includes:")
        print("   - 4 weeks of progressive training")
        print("   - 5-day bodybuilding split routine")
        print("   - Chest/Triceps, Back/Biceps, Shoulders/Abs, Legs (Quads), Legs (Hams/Glutes)")
        print("   - Progressive overload each week")
        print("   - Realistic weights and rep ranges")
        
    except Exception as e:
        print(f"Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main function to clear and populate the database"""
    print("Bodybuilding Database Setup")
    print("=" * 50)
    
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    
    # Clear existing data
    clear_database()
    
    # Populate with bodybuilding data
    populate_bodybuilding_data()
    
    print("\nDatabase setup complete! You can now:")
    print("   - View workouts in the fitness tracker app")
    print("   - Get AI insights on your training patterns")
    print("   - Chat with AI coach about your program")
    print("   - Track your progressive overload")

if __name__ == "__main__":
    main()