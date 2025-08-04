#!/usr/bin/env python3
"""
Production database setup and migration utilities
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_models import Base, User
from auth_utils import get_password_hash
from dotenv import load_dotenv

def setup_production_database():
    """Setup database for production deployment"""
    load_dotenv()
    
    # Get database URL (can be SQLite for simple deployments or PostgreSQL for scale)
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
    
    print(f"Setting up database: {DATABASE_URL}")
    
    # Create engine with production settings
    if DATABASE_URL.startswith("postgresql"):
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user if it doesn't exist
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email=os.getenv("ADMIN_EMAIL", "admin@fitnessapp.com"),
                hashed_password=get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123")),
                is_active=True
            )
            db.add(admin_user)
            print("✅ Admin user created")
        
        # Create test user for development/testing
        test_user = db.query(User).filter(User.username == "testuser").first()
        if not test_user:
            test_user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                is_active=True
            )
            db.add(test_user)
            print("✅ Test user created")
        
        db.commit()
        print("✅ Database setup completed successfully")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    setup_production_database()