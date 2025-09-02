const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

console.log('🚀 POS System Database Setup');
console.log('===========================');

const setupDatabase = async () => {
  try {
    console.log('📋 Database Setup Options:');
    console.log('1. MongoDB Atlas (Recommended for production)');
    console.log('2. Local MongoDB (If you have MongoDB installed)');
    console.log('3. Using current configuration...');
    console.log('');

    // Use environment configuration
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system';
    console.log('🔗 Attempting to connect to:', mongoURI.replace(/\/\/.*@/, '//***:***@'));

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!');

    // Check if admin user already exists
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@pos.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Use the existing password to login');
      return;
    }

    // Create default admin user
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'adminHell0!@#';
    const adminUser = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully!');
    console.log('');
    console.log('🎉 Admin Login Credentials:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('');
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Database setup error:');
    
    if (error.code === 'ENOTFOUND' || error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('🔧 MongoDB Connection Failed - Here are your options:');
      console.log('');
      console.log('Option 1: Install MongoDB locally');
      console.log('- Download MongoDB from: https://www.mongodb.com/try/download/community');
      console.log('- Install and start the MongoDB service');
      console.log('- Run this script again');
      console.log('');
      console.log('Option 2: Use MongoDB Atlas (Cloud - Free tier available)');
      console.log('- Go to: https://www.mongodb.com/atlas');
      console.log('- Create a free account and cluster');
      console.log('- Get your connection string');
      console.log('- Update MONGODB_URI in your .env file');
      console.log('- Run this script again');
      console.log('');
      console.log('Option 3: Use the provided MongoDB Atlas demo');
      console.log('- Contact the developer for MongoDB Atlas credentials');
    } else {
      console.log(error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('📝 Disconnected from MongoDB');
  }
};

setupDatabase();