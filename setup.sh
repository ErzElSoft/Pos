#!/bin/bash

echo "================================"
echo "MERN POS System Setup Script"
echo "================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    echo "After installation, restart your terminal and run this script again."
    exit 1
fi

echo "✓ Node.js is installed"
node --version

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available"
    exit 1
fi

echo "✓ npm is available"
npm --version
echo

echo "Installing dependencies..."
echo

echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi

echo "✓ Root dependencies installed"
echo

echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install server dependencies"
    cd ..
    exit 1
fi
cd ..

echo "✓ Server dependencies installed"
echo

echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install client dependencies"
    cd ..
    exit 1
fi
cd ..

echo "✓ Client dependencies installed"
echo

echo "================================"
echo "Setup completed successfully!"
echo "================================"
echo
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Configure environment variables in server/.env"
echo "3. Run 'npm run dev' to start the application"
echo
echo "For detailed instructions, see README.md"
echo