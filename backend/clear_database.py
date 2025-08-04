#!/usr/bin/env python3
"""
Script to clear all data from the fitness tracker database
"""
import os
from sqlalchemy import create_engine, text
from database_models import Base
from dotenv import load_dotenv

def clear_database():
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
    
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    print("Clearing database...")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("Dropped all tables")
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("Recreated clean table structure")
    
    print("Database cleared successfully!")

if __name__ == "__main__":
    clear_database()