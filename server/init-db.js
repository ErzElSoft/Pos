const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@pos.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@pos.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'adminHell0!@#',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Default admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', process.env.DEFAULT_ADMIN_PASSWORD || 'adminHell0!@#');

  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

initializeDatabase();