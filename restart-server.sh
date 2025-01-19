#!/bin/bash

# Find and kill any process running on port 3000
PID=$(lsof -ti:3000)
if [ ! -z "$PID" ]; then
    echo "Killing process $PID running on port 3000"
    kill -9 $PID
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server and save logs
echo "Starting server..."
node server.js > logs/server.log 2>&1
