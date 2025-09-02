const mongoose = require('mongoose');

// Determine which middleware to use based on MongoDB connection
const getAuthMiddleware = () => {
  if (mongoose.connection.readyState === 1) {
    // MongoDB is connected, use regular middleware
    return require('./auth');
  } else {
    // MongoDB not connected, use fallback middleware
    return require('./auth-fallback');
  }
};

module.exports = {
  get authenticateToken() {
    return getAuthMiddleware().authenticateToken;
  },
  get authorizeRoles() {
    return getAuthMiddleware().authorizeRoles;
  },
  get adminOnly() {
    return getAuthMiddleware().adminOnly;
  },
  get adminOrSelf() {
    return getAuthMiddleware().adminOrSelf;
  },
  get optionalAuth() {
    return getAuthMiddleware().optionalAuth;
  }
};