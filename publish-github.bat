@echo off
echo 🚀 Publishing POS System to GitHub...
echo ====================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Not in POS project root directory
    echo Please run this script from the POS project folder
    pause
    exit /b 1
)

REM Add all files
echo 📝 Adding files to git...
git add .

REM Commit with deployment-ready message
echo 💾 Committing changes...
git commit -m "🚀 Production ready: POS System with auto-deployment

✨ Features:
- Complete MERN stack POS system
- Role-based authentication (Admin/Cashier)
- Touch-optimized cashier interface
- Real-time inventory management
- Sales analytics and reporting
- Mobile-responsive design
- Offline support with local storage fallback

🛠 Technical:
- React 18 + Vite frontend
- Node.js + Express backend
- MongoDB database
- JWT authentication
- Tailwind CSS styling

📦 Deployment:
- Railway backend deployment ready
- Vercel frontend deployment ready
- GitHub Actions CI/CD configured
- Environment variables documented

🔗 Auto-deployment configured for:
- Backend: Railway.app
- Frontend: Vercel.com
- Database: MongoDB Atlas"

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔗 Remote origin already configured
    echo 📤 Pushing to existing repository...
    git push origin main
) else (
    echo.
    echo 🔗 Setting up GitHub remote...
    echo.
    echo 📋 NEXT STEPS:
    echo 1. Go to https://github.com/new
    echo 2. Create repository named: 'Pos' or 'POS-System'
    echo 3. Don't initialize with README (we have our own)
    echo 4. Copy the repository URL
    echo.
    set /p repo_url="Enter your GitHub repository URL: "
    
    if defined repo_url (
        git remote add origin "%repo_url%"
        git branch -M main
        echo 📤 Pushing to GitHub...
        git push -u origin main
        echo.
        echo 🎉 SUCCESS! Your POS system is now on GitHub!
        echo Repository: %repo_url%
    ) else (
        echo ❌ No repository URL provided
        echo 💡 You can add it later with:
        echo    git remote add origin YOUR_REPO_URL
        echo    git push -u origin main
    )
)

echo.
echo 🚀 DEPLOYMENT SETUP:
echo ===================
echo.
echo 📋 Your repository is ready for auto-deployment!
echo.
echo 🔧 To enable auto-deployment:
echo 1. 🚂 Railway: Connect your GitHub repo in Railway dashboard
echo 2. ▲ Vercel: Import project from GitHub in Vercel dashboard  
echo 3. 🔐 Set environment variables (see DEPLOYMENT_VARS.md)
echo.
echo 💡 Manual deployment guides:
echo    - QUICK_DEPLOY.md (10-minute setup)
echo    - DEPLOYMENT_VARS.md (environment variables)
echo.
echo ✅ Your POS system is ready to showcase!
echo.
pause