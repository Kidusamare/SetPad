# Fitness Tracker API

A comprehensive AI-powered fitness tracking and coaching API built with FastAPI, SQLAlchemy, and OpenAI integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
  - [Core Workout Management](#core-workout-management)
  - [Data Import](#data-import)
  - [AI Coaching](#ai-coaching)
- [Module Documentation](#module-documentation)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Usage Examples](#usage-examples)
- [AI Features](#ai-features)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Overview

The Fitness Tracker API is a modern, AI-enhanced backend service designed to help users track their workouts, analyze their progress, and receive personalized fitness coaching. Built with FastAPI for high performance and scalability, it integrates OpenAI's GPT models to provide intelligent insights and recommendations.

## Features

### Core Features
- **Workout Management**: Create, read, update, and delete workout sessions
- **Exercise Tracking**: Detailed logging of exercises, sets, reps, and weights
- **Data Import**: AI-powered import from various file formats
- **Progress Analytics**: Comprehensive workout pattern analysis
- **AI Coaching**: Interactive fitness coaching with personalized advice
- **Exercise Recommendations**: Intelligent exercise suggestions and alternatives

### AI-Powered Features
- **Smart Data Processing**: Converts unstructured workout data into organized sessions
- **Personalized Coaching**: Context-aware fitness advice based on workout history
- **Workout Generation**: Custom workout plans based on goals and preferences
- **Progress Insights**: AI-generated analysis of training patterns and recommendations

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
backend/
├── main.py                    # FastAPI application and route definitions
├── models.py                  # SQLAlchemy database models
├── schemas.py                 # Pydantic data validation schemas
├── db.py                     # Database helper functions and utilities
├── ai.py                     # OpenAI integration and AI functions
├── get_endpoints.py          # GET endpoint implementations
├── put_post_endpoints.py     # POST/PUT endpoint implementations
├── requirements.txt          # Python dependencies
└── data.db                   # SQLite database file
```

## API Endpoints

### Core Workout Management

#### `GET /`
- **Purpose**: API health check
- **Returns**: Status message confirming backend is running
- **Use Case**: Deployment verification, connectivity testing

#### `GET /tables`
- **Purpose**: Retrieve all workout sessions
- **Returns**: `List[TableSchema]` - All workouts sorted by date (newest first)
- **Features**: Complete workout data including exercises and sets
- **Use Case**: Dashboard loading, workout history browsing

#### `GET /tables/{table_id}`
- **Purpose**: Get specific workout by ID
- **Parameters**: `table_id` - Unique workout identifier
- **Returns**: `TableSchema` - Complete workout details
- **Use Case**: Workout editing, detailed workout view

#### `POST /tables`
- **Purpose**: Create new workout session
- **Request Body**: `TableSchema` - Complete workout data
- **Returns**: `TableSchema` - Created workout with database IDs
- **Validation**: Prevents duplicate IDs, validates all fields
- **Use Case**: Manual workout creation, template instantiation

#### `PUT /tables/{table_id}`
- **Purpose**: Update existing workout
- **Parameters**: `table_id` - Workout identifier
- **Request Body**: `TableSchema` - Updated workout data
- **Returns**: `TableSchema` - Updated workout
- **Use Case**: Workout editing, adding exercises/sets

#### `DELETE /tables/{table_id}`
- **Purpose**: Delete workout session
- **Parameters**: `table_id` - Workout identifier
- **Returns**: Success confirmation
- **Use Case**: Removing unwanted workouts

### Data Import

#### `POST /import-data`
- **Purpose**: AI-powered workout data import
- **Request**: Multipart form with file upload
- **Supported Formats**: Text files, CSV, structured workout data
- **Features**: 
  - AI parsing of unstructured data
  - Multiple session detection
  - Bulk import capability
  - Error resilience with partial imports
- **Returns**: Import summary with success/failure counts
- **Use Case**: Bulk data migration, importing from other fitness apps

#### `POST /import-data-simple`
- **Purpose**: Basic file import without AI processing
- **Request**: Multipart form with file upload
- **Features**: Fast processing, AI service fallback
- **Returns**: Simple import confirmation
- **Use Case**: Testing, simple file processing

### AI Coaching

#### `POST /ai-coaching`
- **Purpose**: Interactive AI fitness coaching
- **Request Body**: `AICoachingRequest`
  - `message`: User's question or request
  - `conversation_history`: Previous chat messages
  - `user_data`: Optional user context
- **Returns**: `AICoachingResponse` with AI-generated advice
- **Features**:
  - Context-aware responses using workout history
  - Conversation memory and continuity
  - Personalized advice based on user data
- **Use Case**: Form guidance, workout planning, nutrition advice

#### `GET /ai-coaching/workout-analysis`
- **Purpose**: AI analysis of workout patterns
- **Returns**: Object with analytics and AI insights
- **Features**:
  - Training frequency analysis
  - Exercise variety assessment
  - Muscle group balance evaluation
  - Personalized improvement recommendations
- **Use Case**: Progress tracking, training optimization

#### `POST /ai-coaching/generate-workout`
- **Purpose**: Generate personalized workout plans
- **Request Parameters**:
  - `fitness_level`: beginner/intermediate/advanced
  - `goals`: muscle gain, fat loss, strength, etc.
  - `duration`: workout length in minutes
  - `equipment`: gym, home, bodyweight, etc.
  - `focus_areas`: specific muscle groups or patterns
- **Features**: AI-generated structure with user history integration
- **Use Case**: Workout planning, program design, training variation

#### `POST /ai-coaching/exercise-suggestions`
- **Purpose**: Get intelligent exercise alternatives
- **Request Parameters**:
  - `muscle_group`: target muscle group
  - `current_exercise`: exercise to find alternatives for
  - `context`: training context (progressive_overload, etc.)
- **Features**: Context-aware suggestions with extensive exercise database
- **Use Case**: Exercise variation, equipment substitutions

## Module Documentation

### `models.py` - Database Models
SQLAlchemy ORM models defining the database schema:
- **Table**: Workout sessions with metadata
- **Row**: Individual exercises within workouts
- **Set**: Sets within exercises with reps and weight

### `schemas.py` - Data Validation
Pydantic schemas for request/response validation:
- **TableSchema**: Complete workout session structure
- **RowSchema**: Exercise with multiple sets
- **SetSchema**: Single set with reps and weight
- **AICoachingRequest/Response**: AI interaction models

### `db.py` - Database Operations
Database helper functions and utilities:
- **Connection Management**: Database session handling
- **Data Transformation**: ORM to Pydantic conversion
- **Analytics Functions**: Workout pattern analysis
- **CRUD Operations**: Create, read, update helpers

### `ai.py` - AI Integration
OpenAI API integration and AI-powered features:
- **Data Processing**: Smart import and parsing
- **Coaching System**: Conversational AI coach
- **Workout Generation**: AI-created workout plans
- **Exercise Database**: Comprehensive exercise library

### `get_endpoints.py` - GET Routes
Implementation of all GET endpoint handlers:
- **Data Retrieval**: Workout fetching and listing
- **Analytics**: AI-powered workout analysis
- **Health Checks**: API status verification

### `put_post_endpoints.py` - POST/PUT Routes
Implementation of data modification endpoints:
- **Workout Management**: Create and update operations
- **File Import**: Data import with AI processing
- **AI Features**: Coaching and generation endpoints

## Database Schema

### Tables Relationship
```
Table (Workout Session)
├── id: String (Primary Key)
├── tableName: String
├── date: String
└── rows: List[Row]

Row (Exercise)
├── id: Integer (Primary Key)
├── table_id: String (Foreign Key)
├── muscleGroup: String
├── exercise: String
├── notes: String
├── showNotes: Boolean
├── weightUnit: String
└── sets: List[Set]

Set (Individual Set)
├── id: Integer (Primary Key)  
├── row_id: Integer (Foreign Key)
├── reps: String
└── weight: String
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager
- OpenAI API key

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-tracker-frontend
   ```

2. **Backend Setup**
   ```bash
   cd Backend  # Note: Use uppercase 'Backend' directory
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On Linux/Mac
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   pip install "bcrypt<4.0"  # Fix bcrypt compatibility issue
   ```

4. **Create test user (required for AI coaching)**
   ```bash
   python create_test_user.py
   ```

5. **Set up environment variables**
   ```bash
   # Create .env file in Backend directory
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   echo "DATABASE_URL=sqlite:///./data.db" >> .env
   ```

6. **Run the backend server**
   ```bash
   # IMPORTANT: Run from Backend directory (uppercase)
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

7. **Frontend Setup (in separate terminal)**
   ```bash
   cd Frontend
   npm install
   npm start
   ```

### Important Setup Notes

#### Directory Structure Issue
⚠️ **Critical**: The project has two backend directories:
- `backend/` (lowercase) - Old/incomplete version
- `Backend/` (uppercase) - Current version with authentication

**Always run the server from the `Backend/` directory (uppercase)** to ensure:
- Authentication works properly
- AI coaching endpoints function correctly  
- Database contains the required user accounts

#### Authentication Setup
The system requires authentication for AI coaching features:
- Test user credentials: `username: testuser`, `password: password123`
- Create additional users via `/auth/register` endpoint
- Login endpoint: `POST /auth/token` (not `/auth/login`)

#### Common Issues and Solutions

**AI Coaching Network Errors:**
- Ensure server is running from `Backend/` directory (uppercase)
- Verify bcrypt version: `pip install "bcrypt<4.0"`
- Check test user exists: `python create_test_user.py`
- Confirm authentication works: Test `POST /auth/token` endpoint

**Database Issues:**
- Different directories use different database files
- `Backend/data.db` contains authentication users
- `backend/data.db` is outdated and missing auth data

## Environment Variables

Create a `.env` file in the `Backend/` directory (uppercase):

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration  
DATABASE_URL=sqlite:///./data.db

# Optional: For production deployments
# DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Required Variables
- **OPENAI_API_KEY**: Your OpenAI API key for AI features
- **DATABASE_URL**: Database connection string (defaults to SQLite)

## Usage Examples

### Creating a Workout
```python
import requests

workout_data = {
    "id": "workout_20250126",
    "tableName": "Push Day",
    "date": "2025-01-26",
    "rows": [
        {
            "muscleGroup": "Chest",
            "exercise": "Bench Press",
            "notes": "Focus on form",
            "showNotes": True,
            "weightUnit": "lbs",
            "sets": [
                {"reps": "10", "weight": "135"},
                {"reps": "8", "weight": "145"},
                {"reps": "6", "weight": "155"}
            ]
        }
    ]
}

response = requests.post("http://localhost:8000/tables", json=workout_data)
print(response.json())
```

### AI Coaching Interaction
```python
coaching_request = {
    "message": "What's a good chest workout for beginners?",
    "conversation_history": [],
    "user_data": {}
}

response = requests.post("http://localhost:8000/ai-coaching", json=coaching_request)
print(response.json()["response"])
```

### Importing Workout Data
```python
files = {"file": ("workout.txt", open("workout_data.txt", "rb"))}
response = requests.post("http://localhost:8000/import-data", files=files)
print(response.json())
```

### Getting Workout Analysis
```python
response = requests.get("http://localhost:8000/ai-coaching/workout-analysis")
analysis = response.json()
print(analysis["ai_insights"])
```

## AI Features

### Smart Data Import
The AI import system can process various formats:
- **Unstructured Text**: "Did bench press 135x10, 145x8, squats 185x12"  
- **CSV Data**: Structured exercise logs
- **Multiple Sessions**: Automatically detects and separates different workouts
- **Error Recovery**: Continues processing despite individual entry failures

### Personalized Coaching
The AI coach provides:
- **Form Guidance**: Exercise technique and safety tips
- **Program Design**: Workout structure and progression advice
- **Motivation**: Encouragement and goal setting
- **Nutrition**: Basic dietary recommendations
- **Injury Prevention**: Safe training practices

### Workout Generation
AI-generated workouts consider:
- **Fitness Level**: Beginner, intermediate, advanced modifications
- **Goals**: Strength, hypertrophy, endurance, fat loss
- **Equipment**: Gym, home, bodyweight options
- **Time Constraints**: 15-90 minute sessions
- **Training History**: Incorporates user's exercise preferences

### Exercise Recommendations
Smart suggestions based on:
- **Muscle Groups**: Targeted and synergistic muscles
- **Movement Patterns**: Push/pull/leg categories
- **Progressive Overload**: Logical exercise progressions
- **Equipment Available**: Substitutions for missing equipment

## Error Handling

### HTTP Status Codes
- **200 OK**: Successful requests
- **400 Bad Request**: Invalid data, duplicate IDs, empty files
- **404 Not Found**: Workout not found for updates
- **500 Internal Server Error**: Database errors, AI service failures

### Validation
- **Pydantic Validation**: Automatic request/response validation
- **Database Constraints**: Foreign key and uniqueness validation
- **File Validation**: Content and format checks

### Resilience Features
- **Partial Import Success**: Continues processing despite individual failures
- **AI Fallbacks**: Rule-based alternatives when AI unavailable
- **Transaction Safety**: Database rollback on errors
- **Graceful Degradation**: Core features work without AI

## API Testing

### Using curl
```bash
# Health check
curl http://localhost:8000/

# Authentication (required for protected endpoints)
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123"

# Get all workouts (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:8000/tables

# Create workout (requires authentication)
curl -X POST http://localhost:8000/tables \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"id":"test_workout","tableName":"Test","date":"2025-01-26","rows":[]}'

# AI coaching (requires authentication)
curl -X POST http://localhost:8000/ai-coaching \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message":"What is progressive overload?","conversation_history":[],"user_data":null}'
```

### Using Swagger UI
Visit `http://localhost:8000/docs` for interactive API documentation.

## Troubleshooting

### AI Coaching Network Errors

**Problem**: AI coaching chat returns network errors or "Not authenticated" messages.

**Root Cause**: The backend server was running from the wrong directory (`backend/` instead of `Backend/`), causing authentication failures due to database mismatch.

**Solution**:
1. **Stop any running servers**:
   ```bash
   # On Windows
   taskkill /f /im python.exe
   
   # On Linux/Mac  
   pkill -f uvicorn
   ```

2. **Ensure correct directory**:
   ```bash
   cd Backend  # Uppercase 'B' is critical
   ```

3. **Fix bcrypt compatibility**:
   ```bash
   pip install "bcrypt<4.0" --upgrade
   ```

4. **Verify test user exists**:
   ```bash
   python create_test_user.py
   ```

5. **Start server from correct directory**:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

6. **Test authentication**:
   ```bash
   curl -X POST http://localhost:8000/auth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=testuser&password=password123"
   ```

**Verification**: You should receive a JWT token response like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Database Issues

**Problem**: Users or workouts not found, authentication fails.

**Cause**: Multiple database files in different directories.

**Solution**:
- Use `Backend/data.db` (contains authentication users)
- Avoid `backend/data.db` (outdated, missing auth data)
- Always run server from `Backend/` directory

### Frontend Connection Issues

**Problem**: Frontend shows "Network Error" when accessing AI coaching.

**Solution**:
1. Verify backend is running on `http://localhost:8000`
2. Check CORS settings allow `http://localhost:3000`
3. Ensure authentication context is properly configured
4. Test login flow before accessing AI coaching

### bcrypt Version Compatibility

**Problem**: `AttributeError: module 'bcrypt' has no attribute '__about__'`

**Solution**:
```bash
pip install "bcrypt<4.0" --upgrade
```

This downgrades bcrypt to a compatible version that works with the current passlib configuration.

## Performance Considerations

### Database Optimization
- **Connection Pooling**: Efficient database connection management
- **Lazy Loading**: Relationships loaded only when needed
- **Indexing**: Primary and foreign key indexes for fast queries

### AI Integration
- **Rate Limiting**: Managed OpenAI API usage to stay within limits
- **Caching**: Response caching for repeated queries
- **Fallback Systems**: Non-AI alternatives for core functionality

### Scalability
- **Stateless Design**: No server-side session storage
- **Modular Architecture**: Easy horizontal scaling
- **Async Support**: FastAPI's native async capabilities

## Security

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- **API Key Security**: Environment variable storage
- **CORS Configuration**: Controlled cross-origin access

### Best Practices
- **Error Handling**: No sensitive information in error messages
- **Rate Limiting**: Protection against abuse
- **Data Sanitization**: Clean user inputs before processing

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- **PEP 8**: Python style guide compliance
- **Type Hints**: Use type annotations
- **Documentation**: Docstrings for all functions
- **Testing**: Unit tests for new features

### Module Guidelines
- **Single Responsibility**: Each module has a clear purpose
- **Loose Coupling**: Minimal dependencies between modules
- **High Cohesion**: Related functionality grouped together
- **Clear Interfaces**: Well-defined module boundaries

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or contributions:
- **Issues**: GitHub Issues tracker
- **Documentation**: Check module README sections
- **API Docs**: Swagger UI at `/docs` endpoint

---

*Built with ❤️ using FastAPI, SQLAlchemy, and OpenAI*