#!/bin/bash

echo "Starting POS System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "npm is not available!"
    echo "Please ensure Node.js is properly installed."
    exit 1
fi

echo "Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install root dependencies"
    exit 1
fi

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install server dependencies"
    cd ..
    exit 1
fi
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install client dependencies"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "Dependencies installed successfully!"
echo "Starting both client and server..."
echo ""
echo "Server will run on http://localhost:5000"
echo "Client will run on http://localhost:3000"
echo ""

# Start both client and server using npm script
npm run dev