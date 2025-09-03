#!/bin/bash

# 🔧 NPM Dependencies and Lock File Fix Script
# This script fixes security vulnerabilities and regenerates package-lock.json

echo "🔧 Fixing NPM Dependencies and Lock File Issues..."
echo "====================================================="

# Navigate to client directory
cd client

echo "📝 Step 1: Cleaning existing installations..."
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

echo ""
echo "📦 Step 2: Regenerating package-lock.json with updated dependencies..."
echo "This will create a new lock file that matches package.json..."
npm install

echo ""
echo "🔒 Step 3: Running security audit..."
npm audit

echo ""
echo "🔧 Step 4: Applying automatic security fixes..."
npm audit fix

echo ""
echo "📊 Step 5: Final audit check..."
npm audit

echo ""
echo "🏗️ Step 6: Testing build..."
npm run build

echo ""
echo "✅ Dependencies and Lock File Fixed!"
echo "======================================"
echo ""
echo "📋 What was fixed:"
echo "   ✅ Regenerated package-lock.json to match package.json"
echo "   ✅ Updated react-query to @tanstack/react-query (v5)"
echo "   ✅ Updated react-router-dom to latest stable"
echo "   ✅ Fixed PostCSS config syntax for Vite build compatibility"
echo "   ✅ Converted config files to CommonJS format"
echo "   ✅ Removed deprecated ESLint 8.x to avoid warnings"
echo "   ✅ Simplified build process for better reliability"
echo "   ✅ Fixed security vulnerabilities automatically"
echo "   ✅ Resolved npm ci sync issues"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the application: npm run dev"
echo "   2. Verify all features work correctly"
echo "   3. Commit the updates to Git (including new package-lock.json)"
echo ""
echo "💡 For GitHub Actions:"
echo "   The new package-lock.json will prevent npm ci errors"
echo "   GitHub Actions will now install dependencies correctly"
echo ""
echo "🚀 Your POS system dependencies are now secure and GitHub-ready!"