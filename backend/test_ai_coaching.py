#!/usr/bin/env python3
"""
Test script to debug AI coaching functionality
"""
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from database_models import User
from db import analyze_user_workouts
from ai import get_ai_coaching_response
from schemas import MessageSchema
from dotenv import load_dotenv

def test_ai_coaching():
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        # Find a user
        user = db.query(User).first()
        if not user:
            print("No users found in database")
            return
            
        print(f"Testing with user: {user.username} (ID: {user.id})")
        
        # Test analytics
        print("\n1. Testing analyze_user_workouts...")
        analytics = analyze_user_workouts(user.id, db)
        print(f"Analytics result: {analytics}")
        
        # Test AI coaching
        print("\n2. Testing AI coaching...")
        try:
            response = get_ai_coaching_response(
                "Hello, I need help with a workout plan", 
                [], 
                analytics
            )
            print(f"AI Response: {response}")
        except Exception as e:
            print(f"AI Coaching error: {e}")
            import traceback
            traceback.print_exc()
        
    finally:
        db.close()

if __name__ == "__main__":
    test_ai_coaching()