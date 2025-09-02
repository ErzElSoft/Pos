const express = require('express');
const { User } = require('../models');
const { authenticateToken, adminOnly, adminOrSelf } = require('../middleware/auth-fallback');
const { validateUserUpdate, validateId, validatePagination } = require('../middleware/validation');
const LocalStorage = require('../utils/localStorage');
const mongoose = require('mongoose');

const router = express.Router();
const localStorage = new LocalStorage();

// Check if we should use MongoDB or localStorage
const useLocalStorage = () => mongoose.connection.readyState !== 1;

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', adminOnly, validatePagination, async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      console.log('Using localStorage fallback for users listing');
      const users = await localStorage.readFile(localStorage.usersFile);
      
      // Basic filtering
      const search = req.query.search || '';
      const role = req.query.role;
      const isActive = req.query.isActive;
      
      let filteredUsers = users;
      
      if (search) {
        filteredUsers = users.filter(u => 
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      
      if (isActive !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.isActive === (isActive === 'true'));
      }
      
      // Remove passwords and add simple pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const usersWithoutPasswords = filteredUsers.map(({password, ...user}) => user);
      const paginatedUsers = usersWithoutPasswords.slice(skip, skip + limit);
      const totalPages = Math.ceil(filteredUsers.length / limit);
      
      res.json({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers: filteredUsers.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;
    const isActive = req.query.isActive;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', adminOnly, async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      const users = await localStorage.readFile(localStorage.usersFile);
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const cashierUsers = users.filter(u => u.role === 'cashier').length;
      
      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          adminUsers,
          cashierUsers,
          recentRegistrations: 0
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const cashierUsers = await User.countDocuments({ role: 'cashier' });
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        cashierUsers,
        recentRegistrations
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or Self)
router.get('/:id', validateId, adminOrSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or Self - limited fields)
router.put('/:id', validateId, validateUserUpdate, adminOrSelf, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const targetUserId = req.params.id;
    const currentUser = req.user;

    // Get the user to be updated
    const userToUpdate = await User.findById(targetUserId);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object based on user role and permissions
    const updates = {};

    // All users can update their own name
    if (name !== undefined) {
      updates.name = name;
    }

    // Admin-only updates
    if (currentUser.role === 'admin') {
      if (email !== undefined) updates.email = email;
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;
      
      // Prevent admin from deactivating themselves
      if (targetUserId === currentUser._id.toString() && isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account'
        });
      }
      
      // Prevent admin from changing their own role to cashier if they're the only admin
      if (targetUserId === currentUser._id.toString() && role === 'cashier') {
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot change role: You are the only active admin'
          });
        }
      }
    } else {
      // Non-admin users can only update their own name
      if (targetUserId !== currentUser._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
      }
      
      // Remove admin-only fields from updates
      delete updates.email;
      delete updates.role;
      delete updates.isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', validateId, adminOnly, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user;

    // Prevent admin from deleting themselves
    if (targetUserId === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const userToDelete = await User.findById(targetUserId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to delete the last admin
    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last active admin user'
        });
      }
    }

    await User.findByIdAndDelete(targetUserId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/:id/toggle-status
// @desc    Toggle user active status (Admin only)
// @access  Private (Admin)
router.post('/:id/toggle-status', validateId, adminOnly, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user;

    // Prevent admin from deactivating themselves
    if (targetUserId === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to deactivate the last admin
    if (user.role === 'admin' && user.isActive) {
      const activeAdminCount = await User.countDocuments({ 
        role: 'admin', 
        isActive: true 
      });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active admin user'
        });
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;