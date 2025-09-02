const bcrypt = require('bcryptjs');

const testPassword = async () => {
  const plainPassword = 'adminHell0!@#';
  const hashFromFile = '$2a$12$eNNDwWgPp4umt.0J3Yjgu.n2oWTU6EitUaPgnYZjWeiPvX5URwBVq';
  const hashFromServer = '$2a$12$.dOmM5v/R0ClHpV1/.t1wOVyfd0x9geDESzlAwdvKWZJI68ZmYezq';
  
  console.log('🧪 Testing password:', plainPassword);
  console.log('📁 Hash from JSON file:', hashFromFile);
  console.log('🖥️  Hash from server logs:', hashFromServer);
  console.log('');
  
  const resultFromFile = await bcrypt.compare(plainPassword, hashFromFile);
  const resultFromServer = await bcrypt.compare(plainPassword, hashFromServer);
  
  console.log('✅ Result with JSON hash:', resultFromFile);
  console.log('❌ Result with server hash:', resultFromServer);
  
  if (resultFromFile) {
    console.log('🎉 The password should work with the JSON file hash!');
  } else {
    console.log('❌ Something is wrong with the password or hash generation');
  }
};

testPassword();