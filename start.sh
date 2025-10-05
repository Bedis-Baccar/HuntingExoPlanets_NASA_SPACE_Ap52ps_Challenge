#!/bin/bash
# Quick start script for MPGA Flask application

set -e

echo "🚀 MPGA Flask Application - Quick Start"
echo "========================================"
echo ""

# Check Python version
echo "📋 Checking Python version..."
python3 --version || { echo "❌ Python 3 not found. Please install Python 3.11+"; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate || { echo "❌ Failed to activate venv"; exit 1; }

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt || { echo "❌ Failed to install dependencies"; exit 1; }

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Starting Flask development server..."
echo "   Access the app at: http://localhost:5000"
echo "   Press Ctrl+C to stop"
echo ""

# Run the application
python app.py
