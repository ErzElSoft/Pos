# 🛒 POS System - Live Demo

[![Deploy Backend](https://img.shields.io/badge/Railway-Deploy%20Backend-purple?style=for-the-badge&logo=railway)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2FErzElSoft%2FPos)
[![Deploy Frontend](https://img.shields.io/badge/Vercel-Deploy%20Frontend-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FErzElSoft%2FPos&project-name=pos-frontend&framework=vite&env=VITE_API_URL)

> **🎬 [LIVE DEMO](https://your-pos-app.vercel.app)** | **📚 [API Docs](https://your-backend.railway.app/api/health)**

A professional Point of Sale (POS) system built with the MERN stack, featuring role-based authentication, real-time inventory management, and a cashier-optimized interface.

## 🌟 **Live Demo Credentials**
- **Admin:** `admin@pos.com` / `adminHell0!@#`
- **Cashier:** `cashier@pos.com` / `adminHell0!@#`

## ⚡ **One-Click Deployment**

### **Option 1: Auto-Deploy Both (Recommended)**
1. **Fork this repository**
2. **Backend:** [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2FYourUsername%2FPos)
3. **Frontend:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYourUsername%2FPos)

### **Option 2: Manual Setup**
Follow the [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) guide for step-by-step instructions.

## 🚀 **Features**

### **🔐 Authentication & Security**
- JWT-based authentication with secure password hashing
- Role-based access control (Admin & Cashier)
- Automatic role-based navigation
- Session management with token refresh

### **💼 Business Features**
- **Point of Sale Interface** - Touch-optimized for tablets
- **Inventory Management** - Real-time stock tracking
- **Sales Analytics** - Daily, weekly, monthly reports
- **User Management** - Multi-role support
- **Receipt Generation** - Print-ready receipts

### **🛠 Technical Features**
- **Responsive Design** - Works on desktop, tablet, mobile
- **Offline Support** - Local storage fallback
- **Real-time Updates** - Live inventory and sales data
- **RESTful API** - Complete backend API
- **Production Ready** - Deployment configurations included

## 🏗 **Tech Stack**

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Query
- React Router
- React Hook Form

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs + Helmet

**Deployment:**
- Railway (Backend)
- Vercel (Frontend)
- MongoDB Atlas (Database)

## 📱 **Screenshots**

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Admin+Dashboard)

### Cashier POS Interface
![POS Interface](https://via.placeholder.com/800x400/059669/FFFFFF?text=Cashier+POS+Interface)

### Mobile Responsive
![Mobile View](https://via.placeholder.com/400x600/DC2626/FFFFFF?text=Mobile+Responsive)

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+
- MongoDB (local or Atlas)
- Git

### **Local Development**
```bash
# Clone repository
git clone https://github.com/YourUsername/Pos.git
cd Pos

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Start development servers
npm run dev
```

### **Environment Variables**
See [DEPLOYMENT_VARS.md](./DEPLOYMENT_VARS.md) for complete configuration guide.

## 📄 **API Documentation**

### **Authentication Endpoints**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### **Product Endpoints**
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Order Endpoints**
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- 📧 Email: support@erzelsoft.com
- 💬 Issues: [GitHub Issues](https://github.com/YourUsername/Pos/issues)
- 📖 Documentation: [Wiki](https://github.com/YourUsername/Pos/wiki)

---

⭐ **Star this repository if it helped you!**