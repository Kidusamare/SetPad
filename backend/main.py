from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import jwt
import bcrypt
import sqlite3
import os
from datetime import datetime, timedelta
import uuid

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Database setup
DATABASE_URL = "data.db"

def init_db():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Training logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS training_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class UserRegistration(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    email: str

class TrainingLogCreate(BaseModel):
    name: str
    date: str
    data: dict

class TrainingLog(BaseModel):
    id: str
    name: str
    date: str
    data: dict

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    
    return User(id=user[0], email=user[1])

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserRegistration):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    password_hash = hash_password(user.password)
    
    cursor.execute(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
        (user_id, user.email, password_hash)
    )
    conn.commit()
    conn.close()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, password_hash FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user or not verify_password(user.password, db_user[1]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user[0]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Training log endpoints (protected)
@app.post("/api/training-logs", response_model=TrainingLog)
async def create_training_log(
    log: TrainingLogCreate,
    current_user: User = Depends(get_current_user)
):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    log_id = str(uuid.uuid4())
    
    cursor.execute(
        "INSERT INTO training_logs (id, user_id, name, date, data) VALUES (?, ?, ?, ?, ?)",
        (log_id, current_user.id, log.name, log.date, str(log.data))
    )
    conn.commit()
    conn.close()
    
    return TrainingLog(id=log_id, name=log.name, date=log.date, data=log.data)

@app.get("/api/training-logs")
async def get_training_logs(current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, name, date, data FROM training_logs WHERE user_id = ? ORDER BY created_at DESC",
        (current_user.id,)
    )
    logs = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": log[0],
            "name": log[1],
            "date": log[2],
            "data": eval(log[3])  # Note: In production, use proper JSON serialization
        }
        for log in logs
    ]

@app.get("/api/training-logs/{log_id}")
async def get_training_log(log_id: str, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, name, date, data FROM training_logs WHERE id = ? AND user_id = ?",
        (log_id, current_user.id)
    )
    log = cursor.fetchone()
    conn.close()
    
    if not log:
        raise HTTPException(status_code=404, detail="Training log not found")
    
    return {
        "id": log[0],
        "name": log[1],
        "date": log[2],
        "data": eval(log[3])
    }

@app.delete("/api/training-logs/{log_id}")
async def delete_training_log(log_id: str, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute(
        "DELETE FROM training_logs WHERE id = ? AND user_id = ?",
        (log_id, current_user.id)
    )
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Training log not found")
    
    conn.commit()
    conn.close()
    
    return {"message": "Training log deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)