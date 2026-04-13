#!/bin/bash

echo "Starting CineAI ML Service..."
echo "Installing Python dependencies..."

# Install dependencies
pip install -r requirements.txt

echo "Starting Flask app on port 5001..."
python app.py
