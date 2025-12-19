#!/bin/bash

# Ensure we are in the script's directory
cd "$(dirname "$0")"

echo "============================================"
echo "   Job Application Tracker (Electron)"
echo "============================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check for node_modules and install if missing
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dependencies not found. Installing..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies."
        exit 1
    fi
    echo "[INFO] Dependencies installed successfully."
fi

# Run the application
echo "[INFO] Starting Job Application Tracker..."
npm run electron:dev
