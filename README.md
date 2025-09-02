# 🛒 MERN Stack POS System

A comprehensive Point of Sale (POS) system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring role-based authentication, inventory management, and a cashier-friendly interface.

![POS System](https://img.shields.io/badge/MERN-Stack-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication with secure password hashing
- Role-based access control (Admin & Cashier)
- Automatic role-based navigation
- Secure credential management

### 👥 **User Management** (Admin Only)
- Create and manage user accounts
- Role assignment and permissions
- User activity tracking
- Account activation/deactivation

### 📦 **Product Management**
- Complete CRUD operations for products
- Category management and filtering
- Stock level tracking with low stock alerts
- SKU and barcode support
- Bulk product operations

### 🛒 **Point of Sale Interface**
- **Cashier-optimized design** with large, touch-friendly product tiles
- Real-time inventory checking
- Cart management with quantity controls
- Multiple payment method support
- Discount and tax calculations
- Receipt generation

### 📊 **Sales Analytics & Reporting**
- Daily, weekly, and monthly sales reports
- Top-selling products analysis
- Revenue tracking and trends
- Order history and management

### 🔄 **Robust Fallback System**
- Local storage fallback for offline functionality
- Automatic database connection recovery
- Development-friendly error handling

## 🏗️ **Tech Stack**

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Beautiful notifications

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mern-pos-system.git
   cd mern-pos-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   # Update MongoDB URI, JWT secret, etc.
   ```

4. **Database Setup**
   ```bash
   # Seed initial data (admin user + sample products)
   cd server
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   # From project root - starts both server and client
   npm run dev
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000

## 🔑 **Default Credentials**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@pos.com` | `adminHell0!@#` | Full system access |
| **Cashier** | `cashier@pos.com` | `adminHell0!@#` | POS and order management |

## 📱 **User Interface**

### **Admin Dashboard**
- Comprehensive analytics and reporting
- User and product management
- System configuration and settings
- Full access to all features

### **Cashier Interface**
- **Optimized for order-taking** with large product tiles
- **Touch-friendly design** for tablet/touch screen use
- Streamlined checkout process
- Order history and receipt printing

## 🌐 **Deployment Options**

### **Frontend Deployment (Vercel/Netlify)**

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### **Backend Deployment (Railway/Heroku)**

1. **Prepare for deployment**
   ```bash
   # Ensure .env.production is configured
   # Update CLIENT_URL to your deployed frontend URL
   ```

2. **Deploy to Railway**
   ```bash
   # Connect your GitHub repository to Railway
   # Set environment variables in Railway dashboard
   ```

### **Database (MongoDB Atlas)**

1. Create a MongoDB Atlas cluster
2. Update `MONGODB_URI` in your environment variables
3. Whitelist your deployment server IPs

## 📁 **Project Structure**

```
mern-pos-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React context providers
│   │   └── utils/          # API utilities and helpers
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express Backend
│   ├── models/             # MongoDB/Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── data/               # Local storage fallback files
│   └── package.json
├── .gitignore
├── package.json            # Root package.json for concurrently
└── README.md
```

## 🧪 **Testing**

```bash
# Run API integration tests
npm run test-api

# Test individual components
cd client && npm test

# Manual testing checklist
- Admin/Cashier login flows
- Product CRUD operations
- POS order processing
- Payment handling
- Receipt generation
```

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### **Products**
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### **Orders**
- `GET /api/orders` - List orders with filtering
- `POST /api/orders` - Create new order
- `GET /api/orders/stats` - Sales statistics

### **Users** (Admin Only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with the MERN stack
- UI components styled with Tailwind CSS
- Icons by Heroicons
- Authentication with JWT

## 📞 **Support**

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/mern-pos-system/issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

---

**Made with ❤️ for efficient business operations**