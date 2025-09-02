const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const recreateAdminUser = async () => {
  const dataDir = path.join(__dirname, 'data');
  const usersFile = path.join(dataDir, 'users.json');
  
  try {
    console.log('🔄 Recreating users (admin and cashier)...');
    
    // Secure password for both users
    const securePassword = 'adminHell0!@#';
    console.log('🔑 Using secure password for both users:', securePassword);
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(securePassword, salt);
    
    console.log('🔒 Generated hash:', hashedPassword.substring(0, 20) + '...');
    
    // Create admin user
    const adminUser = {
      _id: 'admin_' + Date.now(),
      name: 'System Administrator',
      email: 'admin@pos.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Create cashier user
    const cashierUser = {
      _id: 'cashier_' + Date.now(),
      name: 'Store Cashier',
      email: 'cashier@pos.com',
      password: hashedPassword,
      role: 'cashier',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Replace all users with admin and cashier
    const usersData = [adminUser, cashierUser];
    fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
    
    // Test the password immediately
    const testResult = await bcrypt.compare(securePassword, hashedPassword);
    console.log('🧪 Password test result:', testResult);
    
    console.log('✅ Users created successfully!');
    console.log('👤 Admin - Email: admin@pos.com | Password: adminHell0!@#');
    console.log('👤 Cashier - Email: cashier@pos.com | Password: adminHell0!@#');
    
  } catch (error) {
    console.error('❌ Error recreating users:', error);
  }
};

recreateAdminUser();