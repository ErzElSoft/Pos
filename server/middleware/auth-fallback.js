const { verifyToken } = require('../utils/jwt');
const LocalStorage = require('../utils/localStorage');

const localStorage = new LocalStorage();

// Authenticate token middleware (fallback version)
const authenticateTokenFallback = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    const decoded = verifyToken(token);
    
    // Get user from local storage instead of MongoDB
    const user = await localStorage.findUserByEmail(decoded.email);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'User account is deactivated' 
      });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error('Auth fallback middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Authorize roles middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorizeRoles('admin');

// Admin or specific user middleware (for user management)
const adminOrSelf = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id === req.params.id) {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges or own account required' 
    });
  }
};

// Optional authentication (for public routes that can benefit from user info)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await localStorage.findUserByEmail(decoded.email);
      
      if (user && user.isActive) {
        const { password: _, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken: authenticateTokenFallback,
  authorizeRoles,
  adminOnly,
  adminOrSelf,
  optionalAuth
};