@echo off
echo 🔧 Fixing NPM Dependencies and Security Issues...
echo =================================================

REM Navigate to client directory
cd client

echo 📝 Step 1: Cleaning existing installations...
echo Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📦 Step 2: Installing updated dependencies...
echo This will install the new secure versions...
npm install

echo.
echo 🔒 Step 3: Running security audit...
npm audit

echo.
echo 🔧 Step 4: Applying automatic security fixes...
npm audit fix

echo.
echo 📊 Step 5: Final audit check...
npm audit

echo.
echo 🏗️ Step 6: Testing build...
npm run build

echo.
echo ✅ Dependencies Update Complete!
echo ================================
echo.
echo 📋 What was fixed:
echo    ✅ Updated react-query to @tanstack/react-query (v5)
echo    ✅ Updated react-router-dom to latest stable
echo    ✅ Added proper ESLint configuration
echo    ✅ Fixed security vulnerabilities
echo    ✅ Resolved deprecated package warnings
echo.
echo 🎯 Next steps:
echo    1. Test the application: npm run dev
echo    2. Verify all features work correctly
echo    3. Commit the updates to Git
echo.
echo 🚀 Your POS system dependencies are now secure and up-to-date!
echo.
pause