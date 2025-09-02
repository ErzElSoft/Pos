const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const updateAdminPassword = async () => {
  const dataDir = path.join(__dirname, 'data');
  const usersFile = path.join(dataDir, 'users.json');
  
  try {
    // Read current users
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    // Find admin user
    const adminIndex = usersData.findIndex(user => user.email === 'admin@pos.com');
    
    if (adminIndex !== -1) {
      // Update admin password
      const newPassword = 'adminHell0!@#';
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      usersData[adminIndex].password = hashedPassword;
      usersData[adminIndex].updatedAt = new Date().toISOString();
      
      fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
      
      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email: admin@pos.com');
      console.log('🔑 New Password: adminHell0!@#');
      console.log('');
      console.log('🔒 This password is more secure and should not trigger browser warnings.');
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  }
};

updateAdminPassword();