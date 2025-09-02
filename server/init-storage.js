const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const initLocalStorage = async () => {
  const dataDir = path.join(__dirname, 'data');
  const usersFile = path.join(dataDir, 'users.json');
  
  try {
    // Read current users
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    // Check if admin exists
    const adminExists = usersData.find(user => user.email === 'admin@pos.com');
    
    if (!adminExists) {
      // Create admin user
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'adminHell0!@#';
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
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
      
      usersData.push(adminUser);
      fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@pos.com');
      console.log('🔑 Password:', adminPassword);
    } else {
      console.log('👤 Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

initLocalStorage();