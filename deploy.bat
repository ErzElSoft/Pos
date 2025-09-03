@echo off
echo 🚀 POS System Deployment Script (Windows)
echo ==========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git not initialized. Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit: POS system ready for deployment"
)

echo.
echo 🔧 Deployment Options:
echo 1. Railway (Backend) + Vercel (Frontend) [Recommended]
echo 2. Railway Only (Full Stack)
echo 3. Manual Setup Guide
echo.

set /p option="Choose option (1-3): "

if "%option%"=="1" (
    echo.
    echo 🚀 Option 1: Railway + Vercel Deployment
    echo =========================================
    echo.
    echo 📋 Step-by-step instructions:
    echo.
    echo 🔹 BACKEND (Railway):
    echo    1. Go to https://railway.app
    echo    2. Sign up/login with GitHub
    echo    3. Click 'New Project' → 'Deploy from GitHub repo'
    echo    4. Select this repository
    echo    5. Set environment variables (see DEPLOYMENT_VARS.md)
    echo.
    echo 🔹 FRONTEND (Vercel):
    echo    1. Go to https://vercel.com
    echo    2. Sign up/login with GitHub
    echo    3. Click 'New Project' → Import from GitHub
    echo    4. Select this repository
    echo    5. Set Root Directory to 'client'
    echo    6. Add environment variable: VITE_API_URL=https://your-railway-backend-url.railway.app
    echo.
    echo 🔹 DATABASE (MongoDB Atlas):
    echo    1. Go to https://www.mongodb.com/cloud/atlas
    echo    2. Create free cluster
    echo    3. Create database user
    echo    4. Get connection string
    echo    5. Add to Railway environment variables
) else if "%option%"=="2" (
    echo.
    echo 🚀 Option 2: Railway Full Stack
    echo ===============================
    echo.
    echo 📋 Instructions:
    echo    1. Go to https://railway.app
    echo    2. Deploy from GitHub repo
    echo    3. Railway will detect both frontend and backend
    echo    4. Configure environment variables
) else if "%option%"=="3" (
    echo.
    echo 📖 Opening manual setup guide...
    echo Check DEPLOYMENT_VARS.md for detailed instructions
) else (
    echo ❌ Invalid option
    pause
    exit /b 1
)

echo.
echo 📚 Important files created:
echo    - DEPLOYMENT_VARS.md (Environment variables guide)
echo    - deploy.bat (This script)
echo.
echo 🎉 Your POS system is ready for deployment!
echo    Frontend will be at: https://your-app.vercel.app
echo    Backend API will be at: https://your-app.railway.app
echo.
echo 🔐 Default login credentials:
echo    Admin: admin@pos.com / adminHell0!@#
echo    Cashier: cashier@pos.com / adminHell0!@#
echo.
echo ✅ Deployment preparation complete!
echo.
pause