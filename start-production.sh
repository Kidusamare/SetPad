#!/bin/bash

# Production startup script
echo "🚀 Starting Fitness Tracker in production mode..."

# Set production environment
export ENVIRONMENT=production

# Start backend
echo "🐍 Starting backend server..."
cd Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2 &
BACKEND_PID=$!

# Start frontend (if serving with node)
echo "⚛️  Starting frontend server..."
cd ../Frontend
npx serve -s build -l 3000 &
FRONTEND_PID=$!

# Wait for interrupt signal
echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop services..."

# Cleanup function
cleanup() {
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT
wait