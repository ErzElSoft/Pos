const express = require('express');
const LocalStorage = require('../utils/localStorage');
const { generateAccessToken, verifyAccessToken } = require('../utils/jwt');

const router = express.Router();
const localStorage = new LocalStorage();

// Initialize localStorage when this module loads
console.log('✅ Using fallback authentication with local storage');

// @route   POST /api/auth/login
// @desc    Login user (Fallback to local storage)
// @access  Public
router.post('/login', async (req, res) => {
  console.log('🔍 Login request received:', req.body);
  
  try {
    const { email, password } = req.body;

    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', !!password);

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user in local storage
    console.log('🔍 Looking for user with email:', email);
    const user = await localStorage.findUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    console.log('🔍 Checking password...');
    const isPasswordValid = await localStorage.comparePassword(password, user.password);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password check failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await localStorage.updateUser(user._id, { lastLogin: new Date().toISOString() });

    // Generate token
    const token = generateAccessToken({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    console.log('🎉 Login successful for:', userResponse.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error (fallback):', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token (fallback)
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Find user in local storage
    const user = await localStorage.findUserByEmail(decoded.email);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Token verified',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Token verification error (fallback):', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile (fallback)
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // This would need the auth middleware adapted for local storage
    res.json({
      success: true,
      message: 'Using fallback storage - MongoDB not available',
      data: {
        user: req.user || null
      }
    });
  } catch (error) {
    console.error('Get profile error (fallback):', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;