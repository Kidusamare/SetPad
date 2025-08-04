#!/usr/bin/env python3
"""
Create a test user directly in the main database
"""
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from database_models import Base, User
from auth_utils import get_password_hash
from dotenv import load_dotenv

def create_test_user():
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.username == "testuser").first()
        if existing_user:
            print(f"User testuser already exists with ID: {existing_user.id}")
            return existing_user
        
        # Create new user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"Created user: {user.username} with ID: {user.id}")
        return user
        
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()