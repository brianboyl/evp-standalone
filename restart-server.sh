#!/bin/bash

# Find and kill any process running on port 3000
PID=$(lsof -ti:3000)
if [ ! -z "$PID" ]; then
    echo "Killing process $PID running on port 3000"
    kill -9 $PID
fi

# Start the server
echo "Starting server..."
node server.js
