@echo off
echo Starting POS System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo npm is not available!
    echo Please ensure Node.js is properly installed.
    pause
    exit /b 1
)

echo Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Dependencies installed successfully!
echo Starting both client and server...
echo.
echo Server will run on http://localhost:5000
echo Client will run on http://localhost:3000
echo.

REM Start both client and server using npm script
call npm run dev

pause