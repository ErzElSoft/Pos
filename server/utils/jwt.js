const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'pos-system',
      audience: 'pos-users'
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'pos-system',
      audience: 'pos-users'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate access token for user
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  
  return generateToken(payload);
};

// Verify access token and return decoded payload
const verifyAccessToken = (token) => {
  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};

// Decode token without verification (for expired token info)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
  verifyAccessToken,
  decodeToken
};