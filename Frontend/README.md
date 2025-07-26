# Fitness Tracker App

## Overview
This project is a full-stack fitness tracker application with a React frontend and a FastAPI backend. Users can create, view, update, and delete training logs. The frontend communicates with the backend via REST API calls.

---

## Project Structure

```
fitness-tracker-frontend/
├── backend/
│   ├── main.py           # FastAPI backend (CRUD for logs)
│   ├── requirements.txt  # Backend dependencies
│   └── data.json         # File-based storage for logs
├── src/
│   ├── App.jsx           # Main app and routing
│   ├── components/
│   │   ├── TrainingLogManager.jsx  # Handles all log API calls
│   │   ├── SavedTablesPage.jsx     # Lists and manages logs
│   │   ├── TrainingLogTable.jsx    # Displays/edit a single log
│   │   ├── TrainingLogRow.jsx      # Row for a single exercise
│   │   ├── AutoComplete.jsx        # Suggestion input
│   │   └── Logo.jsx                # App logo
│   ├── context/
│   │   └── ThemeContext.jsx        # Theme provider
│   ├── pages/
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   └── SettingsPage.jsx        # Settings UI
│   ├── services/
│   │   └── api.js                  # All REST API calls
│   └── index.js                    # App entry point
├── package.json
├── README.md
└── ...
```

---

## How Components Are Connected

- **App.jsx**: Sets up routing and theme provider. Main entry for the React app.
- **Dashboard.jsx**: Main landing page. Lets users create new logs and view saved logs.
- **SavedTablesPage.jsx**: Lists all saved logs. Lets users open or delete logs.
- **TrainingLogTable.jsx**: Shows and edits a single log (table of exercises).
- **TrainingLogRow.jsx**: Handles a single exercise row in a log.
- **TrainingLogManager.jsx**: Central logic for all log operations. Calls the backend API for CRUD actions.
- **api.js**: Contains all REST API calls (fetches, creates, updates, deletes logs).
- **ThemeContext.jsx**: Provides dark/light theme support.
- **SettingsPage.jsx**: UI for app settings (theme, etc).
- **AutoComplete.jsx**: Used for exercise/muscle group suggestions.
- **Logo.jsx**: Renders the app logo.

---

## How Frontend and Backend Communicate
- The frontend uses functions in `src/services/api.js` to make HTTP requests to the backend (default: `http://localhost:8000`).
- All log data is stored and managed by the backend (FastAPI, file-based storage).
- The backend exposes REST endpoints for CRUD operations on logs/tables.

---

## Setup Instructions

### 1. Backend (FastAPI)
```sh
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
- The backend runs at `http://localhost:8000` by default.
- API docs available at `http://localhost:8000/docs`

### 2. Frontend (React)
```sh
npm install
npm start
```
- The frontend runs at `http://localhost:3000` by default.
- Make sure the backend is running for full functionality.

---

## Extending the App
- Add new endpoints to the backend as needed (e.g., analytics, user profiles).
- Add new UI features or pages in the frontend.
- Switch backend storage from file to a database for production use.

---

## Contact
For questions or contributions, open an issue or pull request.
