const mongoose = require('mongoose');
const { User, Product } = require('../models');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system');
    console.log('Connected to MongoDB');

    // Create admin user if doesn't exist
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@pos.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔐 Password: ${adminPassword}`);
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create sample cashier user
    const cashierEmail = 'cashier@pos.com';
    const existingCashier = await User.findOne({ email: cashierEmail });
    
    if (!existingCashier) {
      const cashierUser = new User({
        name: 'John Cashier',
        email: cashierEmail,
        password: 'adminHell0!@#',
        role: 'cashier'
      });

      await cashierUser.save();
      console.log('✅ Sample cashier user created');
      console.log(`📧 Email: ${cashierEmail}`);
      console.log(`🔐 Password: adminHell0!@#`);
    }

    // Create sample products if none exist
    const productCount = await Product.countDocuments();
    
    if (productCount === 0) {
      const adminUser = await User.findOne({ email: adminEmail });
      
      const sampleProducts = [
        {
          name: 'Apple iPhone 15',
          description: 'Latest iPhone with advanced features',
          price: 999.99,
          cost: 750.00,
          sku: 'IPHONE15',
          category: 'Electronics',
          stock: 25,
          minStock: 5,
          unit: 'piece',
          createdBy: adminUser._id
        },
        {
          name: 'Samsung Galaxy S24',
          description: 'Premium Android smartphone',
          price: 899.99,
          cost: 680.00,
          sku: 'GALAXY24',
          category: 'Electronics',
          stock: 20,
          minStock: 5,
          unit: 'piece',
          createdBy: adminUser._id
        },
        {
          name: 'Nike Air Force 1',
          description: 'Classic white sneakers',
          price: 120.00,
          cost: 60.00,
          sku: 'NIKE-AF1',
          category: 'Clothing',
          stock: 50,
          minStock: 10,
          unit: 'pair',
          createdBy: adminUser._id
        },
        {
          name: 'Coffee Beans - Premium Blend',
          description: 'Organic premium coffee beans',
          price: 24.99,
          cost: 12.00,
          sku: 'COFFEE-PREM',
          category: 'Food & Beverage',
          stock: 100,
          minStock: 20,
          unit: 'kg',
          createdBy: adminUser._id
        },
        {
          name: 'MacBook Pro 16"',
          description: 'High-performance laptop for professionals',
          price: 2499.99,
          cost: 1800.00,
          sku: 'MBP-16',
          category: 'Electronics',
          stock: 10,
          minStock: 2,
          unit: 'piece',
          createdBy: adminUser._id
        },
        {
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          price: 29.99,
          cost: 15.00,
          sku: 'MOUSE-WL',
          category: 'Electronics',
          stock: 75,
          minStock: 15,
          unit: 'piece',
          createdBy: adminUser._id
        },
        {
          name: 'Notebook - A4',
          description: '200-page ruled notebook',
          price: 5.99,
          cost: 2.50,
          sku: 'NB-A4',
          category: 'Books',
          stock: 200,
          minStock: 50,
          unit: 'piece',
          createdBy: adminUser._id
        },
        {
          name: 'Energy Drink',
          description: 'Sugar-free energy drink',
          price: 3.99,
          cost: 1.50,
          sku: 'ENERGY-SF',
          category: 'Food & Beverage',
          stock: 150,
          minStock: 30,
          unit: 'can',
          createdBy: adminUser._id
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products created successfully');
    } else {
      console.log('ℹ️ Products already exist in database');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 You can now start the server and begin using the POS system.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
};

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;