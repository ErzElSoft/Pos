# Development Guide

## Quick Start

### Prerequisites Check
1. **Node.js**: Run `node --version` (should be v16+)
2. **npm**: Run `npm --version`
3. **MongoDB**: Ensure MongoDB is running locally or you have MongoDB Atlas URI

### Installation
```bash
# Option 1: Use setup script
# Windows:
setup.bat

# Linux/Mac:
chmod +x setup.sh
./setup.sh

# Option 2: Manual installation
npm install
cd server && npm install
cd ../client && npm install
```

### Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Seed the database
cd server
npm run seed
```

### Start Development
```bash
# Start both client and server
npm run dev

# Or start separately:
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

## Testing Instructions

### Manual Testing Checklist

#### 1. Authentication Tests
- [ ] Admin login (admin@pos.com / adminHell0!@#)
- [ ] Cashier login (cashier@pos.com / adminHell0!@#)
- [ ] Invalid credentials handling
- [ ] Token expiration handling
- [ ] Logout functionality

#### 2. Dashboard Tests
- [ ] Admin dashboard shows all stats
- [ ] Cashier dashboard shows limited data
- [ ] Charts render correctly
- [ ] Date selector works

#### 3. Navigation Tests
- [ ] Admin sees all menu items
- [ ] Cashier sees limited menu items
- [ ] Protected routes work
- [ ] Mobile navigation works

#### 4. Profile Tests
- [ ] View profile information
- [ ] Update profile name
- [ ] Change password
- [ ] Form validation works

### API Testing with curl

#### Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"adminHell0!@#"}'

# Get profile (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

#### Products
```bash
# Get products
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer TOKEN"

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Product","price":19.99,"category":"Other","stock":100}'
```

#### Orders
```bash
# Get orders
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN"

# Get order stats
curl -X GET http://localhost:5000/api/orders/stats \
  -H "Authorization: Bearer TOKEN"
```

## Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement backend API if needed
3. Add frontend components
4. Test functionality
5. Update documentation
6. Create pull request

### Code Structure

#### Backend
```
server/
├── models/         # Mongoose schemas
├── routes/         # API route handlers
├── middleware/     # Custom middleware
├── utils/          # Utility functions
└── server.js       # Main server file
```

#### Frontend
```
client/src/
├── components/     # Reusable components
├── contexts/       # React contexts
├── pages/          # Page components
├── utils/          # Utility functions
└── App.jsx         # Main app component
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solutions:**
- Start MongoDB: `mongod` or `brew services start mongodb/brew/mongodb-community`
- Check MongoDB status: `brew services list | grep mongodb`
- Use MongoDB Atlas URI in .env

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solutions:**
- Kill process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
- Change port in server/.env

#### 3. npm install Fails
```
npm ERR! peer dep missing
```
**Solutions:**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check Node.js version compatibility

#### 4. React Build Errors
```
Module not found: Can't resolve
```
**Solutions:**
- Check import paths
- Ensure all dependencies are installed
- Clear cache: `rm -rf node_modules/.cache`

#### 5. API Calls Return 404
**Solutions:**
- Check server is running on port 5000
- Verify API_URL in client/.env
- Check proxy configuration in vite.config.js

### Performance Optimization

#### Backend
- Use indexes in MongoDB schemas
- Implement caching for frequent queries
- Use pagination for large datasets
- Optimize database queries

#### Frontend
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use React Query for caching

### Security Checklist
- [ ] Environment variables are not committed
- [ ] JWT secrets are strong and unique
- [ ] Input validation on all endpoints
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Passwords are hashed
- [ ] SQL injection protection (using Mongoose)
- [ ] XSS protection

## Deployment

### Environment Setup
1. Set NODE_ENV=production
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Configure CORS for production domain

### Build Process
```bash
# Build client
cd client
npm run build

# Server is ready to run
cd ../server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos_system
JWT_SECRET=your-super-strong-production-secret
CLIENT_URL=https://your-frontend-domain.com
```

## Contributing

### Code Style
- Use ES6+ features
- Follow React hooks best practices
- Use consistent naming conventions
- Add JSDoc comments for functions
- Use TypeScript for type safety (future enhancement)

### Git Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with clear commit messages
4. Add tests for new features
5. Update documentation
6. Submit pull request

### Pull Request Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Environment variables documented
- [ ] Breaking changes documented

## Future Enhancements

### Planned Features
- [ ] Advanced reporting and analytics
- [ ] Multi-store support
- [ ] Customer management
- [ ] Loyalty program
- [ ] Inventory alerts
- [ ] Receipt printing
- [ ] Offline mode
- [ ] Mobile app
- [ ] API rate limiting per user
- [ ] Advanced search and filtering

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Database migrations
- [ ] API versioning

## Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tools
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [Postman](https://www.postman.com/) - API testing
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools) - Browser extension

### Support
- Create issues in GitHub repository
- Check existing documentation
- Review troubleshooting section
- Contact development team