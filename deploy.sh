#!/bin/bash

# Deployment script for Fitness Tracker
echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ ERROR: OPENAI_API_KEY is not set"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd Frontend
npm ci
npm run build
cd ..

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd Backend
pip install -r requirements.txt
pip install "bcrypt<4.0"

# Create test user
echo "👤 Creating test user..."
python create_test_user.py

# Database setup complete
echo "✅ Deployment preparation complete!"
echo "🌐 Ready to deploy!"

cd ..