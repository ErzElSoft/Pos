@echo off
echo ================================
echo MERN POS System Setup Script
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo After installation, restart your terminal and run this script again.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo ✓ npm is available
npm --version
echo.

echo Installing dependencies...
echo.

echo Installing root dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo ✓ Root dependencies installed
echo.

echo Installing server dependencies...
cd server
npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✓ Server dependencies installed
echo.

echo Installing client dependencies...
cd client
npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✓ Client dependencies installed
echo.

echo ================================
echo Setup completed successfully!
echo ================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Configure environment variables in server/.env
echo 3. Run "npm run dev" to start the application
echo.
echo For detailed instructions, see README.md
echo.
pause