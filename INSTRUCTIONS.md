# POS System - Complete Instructions

## 🎉 **Project Overview**

This is a comprehensive Point of Sale (POS) system built with the MERN stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS. The system provides complete functionality for managing products, processing sales, tracking orders, and user management with role-based access control.

## 📋 **System Requirements**

Before setting up the POS system, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (for cloning and version control) - [Download here](https://git-scm.com/)

## 🚀 **Quick Start Guide**

### Option 1: Automated Setup (Recommended)

**For Windows:**
```bash
# Simply double-click the start.bat file
# Or run in Command Prompt/PowerShell:
start.bat
```

**For Linux/Mac:**
```bash
# Make the script executable (first time only)
chmod +x start.sh

# Run the startup script
./start.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. **Start the Development Servers**
   ```bash
   # Start both client and server simultaneously
   npm run dev
   
   # OR start them separately:
   # Terminal 1 (Backend):
   npm run server
   
   # Terminal 2 (Frontend):
   npm run client
   ```

## 🌐 **Access the Application**

Once the servers are running:
- **Frontend (React)**: http://localhost:3000
- **Backend (Express API)**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔐 **Demo Credentials**

The system comes with pre-configured demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@pos.com` | `adminHell0!@#` | Full system access |
| **Cashier** | `cashier@pos.com` | `adminHell0!@#` | POS and basic features |

## 📁 **Project Structure**

```
d:\erzel soft\Pos\
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Main application pages
│   │   └── utils/          # API utilities and helpers
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── server/                 # Express Backend API
│   ├── models/             # MongoDB/Mongoose schemas
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware functions
│   ├── utils/              # Helper utilities
│   └── package.json        # Backend dependencies
├── package.json            # Root package with scripts
├── start.bat               # Windows startup script
├── start.sh                # Linux/Mac startup script
├── test-api.js             # API integration tests
├── API_INTEGRATION.md      # Integration verification
├── README.md               # Project documentation
└── INSTRUCTIONS.md         # This file
```

## ✨ **Key Features Implemented**

### 🔐 **Authentication & Authorization**
- JWT-based authentication system
- Role-based access control (Admin/Cashier)
- Secure login/logout functionality
- Profile management for all users

### 📊 **Dashboard & Analytics**
- Real-time sales statistics
- Daily, weekly, and monthly analytics
- Sales charts and visualizations
- Quick access to key metrics

### 🛍️ **Point of Sale (POS) System**
- Interactive product selection
- Real-time cart management
- Multiple payment methods support
- Receipt generation
- Inventory validation during checkout

### 📦 **Product Management**
- Complete CRUD operations for products
- Category-based organization
- Stock level monitoring
- Product search and filtering
- Bulk operations support

### 📋 **Order Management**
- Comprehensive order history
- Order status tracking
- Receipt viewing and printing
- Refund processing (Admin only)
- Advanced filtering and pagination

### 👥 **User Management (Admin Only)**
- User account creation and management
- Role assignment and modification
- User status control (active/inactive)
- User statistics and analytics

## 🛠️ **Available Scripts**

### Root Directory Scripts
```bash
npm run dev          # Start both client and server
npm run server       # Start only the backend server
npm run client       # Start only the frontend client
npm run build        # Build the frontend for production
npm run install-all  # Install all dependencies
npm run test-api     # Run API integration tests
```

### Server Scripts (from /server directory)
```bash
npm run dev          # Start server in development mode
npm start            # Start server in production mode
```

### Client Scripts (from /client directory)
```bash
npm start            # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔧 **Configuration**

### Environment Variables

**Server Configuration** (`.env` in `/server` directory):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=pos_secret_key_2024_mern_stack_development
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
DEFAULT_ADMIN_EMAIL=admin@pos.com
DEFAULT_ADMIN_PASSWORD=adminHell0!@#
```

**Client Configuration** (`.env` in `/client` directory):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=POS System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEV_TOOLS=true
```

## 🧪 **Testing**

### API Integration Tests
Run the comprehensive API test suite:
```bash
npm run test-api
```

This will test:
- Health check endpoints
- Authentication flow
- User management operations
- Product CRUD operations
- Order creation and management

### Manual Testing Checklist
- ✅ Login with both Admin and Cashier roles
- ✅ Navigate through all main sections
- ✅ Create/edit/delete products (Admin)
- ✅ Process sales through POS system
- ✅ View order history and receipts
- ✅ Manage users (Admin only)
- ✅ Update profile information

## 📱 **User Interface Guide**

### Login Screen
- Enter email and password
- Role-based redirection after login
- Demo credentials are displayed for convenience

### Dashboard
- View sales statistics and analytics
- Quick access to main functions
- Real-time data updates

### POS Screen
- Search and select products
- Manage cart items and quantities
- Process payments and generate receipts
- Support for multiple payment methods

### Product Management (Admin)
- View all products in a data table
- Create new products with detailed information
- Edit existing product details
- Delete products (with confirmation)
- Filter and search functionality

### Order Management
- View complete order history
- Access detailed order information
- View and print receipts
- Process refunds (Admin only)

### User Management (Admin)
- Manage user accounts
- Assign roles and permissions
- Monitor user activity
- Create new user accounts

## 🔍 **Troubleshooting**

### Common Issues and Solutions

**1. "npm is not recognized" Error**
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

**2. MongoDB Connection Error**
- **Solution**: Ensure MongoDB is running locally
- Check connection string in server `.env` file
- Default: `mongodb://localhost:27017/pos_system`

**3. Port Already in Use**
- **Solution**: Change port in environment configuration
- Server: Modify `PORT` in `/server/.env`
- Client: Vite will automatically find available port

**4. CORS Errors**
- **Solution**: Verify `CLIENT_URL` in server `.env` matches client URL
- Default: `http://localhost:3000`

**5. JWT Token Issues**
- **Solution**: Clear browser localStorage and login again
- Or change `JWT_SECRET` in server `.env` file

### Development Tips

1. **Use Browser Dev Tools**: Monitor network requests and console logs
2. **Check Server Logs**: Terminal running the server shows detailed logs
3. **Database Issues**: Use MongoDB Compass for database inspection
4. **API Testing**: Use the included `test-api.js` script for endpoint verification

## 🚀 **Deployment Guide**

### Production Build
```bash
# Build the frontend
npm run build

# The build files will be in /client/dist directory
# Deploy these files to your static hosting service
```

### Environment Setup for Production
1. Update environment variables for production
2. Use production MongoDB database
3. Configure proper JWT secrets
4. Set up HTTPS and security headers
5. Configure process managers (PM2 recommended)

### Recommended Hosting Platforms
- **Frontend**: Netlify, Vercel, or AWS S3
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas (cloud)

## 📞 **Support & Documentation**

### Additional Resources
- **API Documentation**: See `API_INTEGRATION.md` for detailed API reference
- **GitHub Repository**: Contains full source code and version history
- **Issue Tracking**: Report bugs and feature requests via GitHub Issues

### Contact Information
- **Developer**: ErzEl Soft
- **Project**: MERN POS System v1.0.0
- **License**: MIT

## 🎯 **Next Steps & Enhancements**

### Potential Future Features
- Real-time notifications with WebSocket
- Mobile application development
- Advanced reporting and analytics
- Integration with payment gateways
- Barcode scanning support
- Multi-location inventory management
- Customer loyalty programs

---

## 📝 **Quick Reference Card**

| Action | Command | URL |
|--------|---------|-----|
| Start System | `npm run dev` | - |
| Frontend | - | http://localhost:3000 |
| Backend API | - | http://localhost:5000 |
| Health Check | - | http://localhost:5000/api/health |
| Admin Login | admin@pos.com / adminHell0!@# | - |
| Cashier Login | cashier@pos.com / adminHell0!@# | - |
| API Tests | `npm run test-api` | - |

---

*Last Updated: December 2024*  
*Version: 1.0.0*  
*Status: Production Ready ✅*