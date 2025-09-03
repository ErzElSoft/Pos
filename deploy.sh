#!/bin/bash

# 🚀 POS System Deployment Script
# This script helps you deploy your POS system quickly

echo "🚀 Starting POS System Deployment..."
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: POS system ready for deployment"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Committing latest changes..."
    git add .
    git commit -m "Pre-deployment: Update configurations"
fi

echo ""
echo "🔧 Deployment Options:"
echo "1. Railway (Backend) + Vercel (Frontend) [Recommended]"
echo "2. Railway Only (Full Stack)"
echo "3. Manual Setup Guide"
echo ""

read -p "Choose option (1-3): " option

case $option in
    1)
        echo ""
        echo "🚀 Option 1: Railway + Vercel Deployment"
        echo "========================================="
        echo ""
        echo "📋 Step-by-step instructions:"
        echo ""
        echo "🔹 BACKEND (Railway):"
        echo "   1. Go to https://railway.app"
        echo "   2. Sign up/login with GitHub"
        echo "   3. Click 'New Project' → 'Deploy from GitHub repo'"
        echo "   4. Select this repository"
        echo "   5. Set environment variables (see DEPLOYMENT_VARS.md)"
        echo ""
        echo "🔹 FRONTEND (Vercel):"
        echo "   1. Go to https://vercel.com"
        echo "   2. Sign up/login with GitHub"
        echo "   3. Click 'New Project' → Import from GitHub"
        echo "   4. Select this repository"
        echo "   5. Set Root Directory to 'client'"
        echo "   6. Add environment variable: VITE_API_URL=https://your-railway-backend-url.railway.app"
        echo ""
        echo "🔹 DATABASE (MongoDB Atlas):"
        echo "   1. Go to https://www.mongodb.com/cloud/atlas"
        echo "   2. Create free cluster"
        echo "   3. Create database user"
        echo "   4. Get connection string"
        echo "   5. Add to Railway environment variables"
        ;;
    2)
        echo ""
        echo "🚀 Option 2: Railway Full Stack"
        echo "==============================="
        echo ""
        echo "📋 Instructions:"
        echo "   1. Go to https://railway.app"
        echo "   2. Deploy from GitHub repo"
        echo "   3. Railway will detect both frontend and backend"
        echo "   4. Configure environment variables"
        ;;
    3)
        echo ""
        echo "📖 Opening manual setup guide..."
        echo "Check DEPLOYMENT_VARS.md for detailed instructions"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "📚 Important files created:"
echo "   - DEPLOYMENT_VARS.md (Environment variables guide)"
echo "   - This script (deploy.sh)"
echo ""
echo "🎉 Your POS system is ready for deployment!"
echo "   Frontend will be at: https://your-app.vercel.app"
echo "   Backend API will be at: https://your-app.railway.app"
echo ""
echo "🔐 Default login credentials:"
echo "   Admin: admin@pos.com / adminHell0!@#"
echo "   Cashier: cashier@pos.com / adminHell0!@#"
echo ""
echo "✅ Deployment preparation complete!"