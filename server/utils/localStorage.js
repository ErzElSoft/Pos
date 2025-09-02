const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

class LocalStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.ordersFile = path.join(this.dataDir, 'orders.json');
    this.productsFile = path.join(this.dataDir, 'products.json');
    this.init();
  }

  async init() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    await this.initFile(this.usersFile, []);
    await this.initFile(this.ordersFile, []);
    await this.initFile(this.productsFile, []);
    
    // Create default admin user if no users exist
    await this.createDefaultAdmin();
  }

  async initFile(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async readFile(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  async writeFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async createDefaultAdmin() {
    console.log('🔍 Checking for existing admin users...');
    const users = await this.readFile(this.usersFile);
    const adminExists = users.find(user => user.role === 'admin');
    
    if (adminExists) {
      console.log('✅ Admin user already exists:', adminExists.email);
    }
    
    // Add sample data for demo
    await this.initializeSampleData();
    
    console.log('📦 Local storage initialized for development');
  }

  async initializeSampleData() {
    try {
      // Initialize products if empty
      const products = await this.readFile(this.productsFile);
      if (products.length === 0) {
        const sampleProducts = [
          {
            _id: 'prod_1',
            name: 'Coffee Beans',
            category: 'Beverages',
            price: 12.99,
            stock: 100,
            sku: 'COF001',
            description: 'Premium coffee beans',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'prod_2', 
            name: 'Notebook',
            category: 'Stationery',
            price: 5.99,
            stock: 50,
            sku: 'NOT001',
            description: 'A5 lined notebook',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'prod_3',
            name: 'Wireless Mouse', 
            category: 'Electronics',
            price: 25.99,
            stock: 8,
            sku: 'MOU001',
            description: 'Bluetooth wireless mouse',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        await this.writeFile(this.productsFile, sampleProducts);
        console.log('📦 Sample products created');
      }

      // Initialize orders if empty
      const orders = await this.readFile(this.ordersFile);
      if (orders.length === 0) {
        const sampleOrders = [
          {
            _id: 'order_1',
            orderNumber: 'ORD-001',
            items: [
              {
                product: 'prod_1',
                quantity: 2,
                price: 12.99
              }
            ],
            subtotal: 25.98,
            tax: 2.60,
            total: 28.58,
            paymentMethod: 'cash',
            status: 'completed',
            cashier: 'admin_fresh_1756258016275',
            cashierName: 'System Administrator',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        await this.writeFile(this.ordersFile, sampleOrders);
        console.log('🛒 Sample orders created');
      }
    } catch (error) {
      console.log('Sample data initialization skipped:', error.message);
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // User methods
  async findUserByEmail(email) {
    const users = await this.readFile(this.usersFile);
    return users.find(user => user.email === email);
  }

  async updateUser(userId, updates) {
    const users = await this.readFile(this.usersFile);
    const userIndex = users.findIndex(user => user._id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
      await this.writeFile(this.usersFile, users);
      return users[userIndex];
    }
    return null;
  }

  async comparePassword(plainPassword, hashedPassword) {
    console.log('🔍 comparePassword called with:');
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Bcrypt compare result:', result);
    
    return result;
  }

  async createUser(userData) {
    try {
      const users = await this.readFile(this.usersFile);
      
      // Check if user with email already exists
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists`);
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const newUser = {
        _id: this.generateId(),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'cashier',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
      await this.writeFile(this.usersFile, users);
      
      console.log(`✅ User created: ${newUser.email} (${newUser.role})`);
      return newUser;
    } catch (error) {
      console.log('User creation failed:', error.message);
      throw error;
    }
  }

  // Order methods
  async getOrders(filter = {}) {
    const orders = await this.readFile(this.ordersFile);
    return orders.filter(order => {
      if (filter.status && order.status !== filter.status) return false;
      if (filter.cashier && order.cashier !== filter.cashier) return false;
      if (filter.startDate && new Date(order.createdAt) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(order.createdAt) > new Date(filter.endDate)) return false;
      return true;
    });
  }

  async getOrderStats(startDate, endDate) {
    try {
      const orders = await this.getOrders({ 
        status: 'completed',
        startDate,
        endDate
      });
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue
      };
    } catch (error) {
      console.log('Order stats fallback - returning empty data');
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      };
    }
  }

  async getDailySales(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const orders = await this.getOrders({
        status: 'completed',
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      });
      
      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      
      return {
        date,
        totalSales,
        totalOrders,
        orders
      };
    } catch (error) {
      console.log('Daily sales fallback - returning empty data');
      return {
        date,
        totalSales: 0,
        totalOrders: 0,
        orders: []
      };
    }
  }

  // Product methods
  async getProducts() {
    try {
      return await this.readFile(this.productsFile);
    } catch (error) {
      console.log('Products fallback - returning empty array');
      return [];
    }
  }

  async getProductStats() {
    try {
      const products = await this.getProducts();
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.isActive).length;
      const lowStockProducts = products.filter(p => p.stock < 10).length;
      
      return {
        totalProducts,
        activeProducts,
        lowStockProducts
      };
    } catch (error) {
      console.log('Product stats fallback - returning empty data');
      return {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0
      };
    }
  }

  async getLowStockProducts(threshold = 10) {
    try {
      const products = await this.getProducts();
      return products.filter(product => product.stock < threshold && product.isActive);
    } catch (error) {
      console.log('Low stock products fallback - returning empty array');
      return [];
    }
  }

  async createProduct(productData) {
    try {
      const products = await this.getProducts();
      const newProduct = {
        _id: this.generateId(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      products.push(newProduct);
      await this.writeFile(this.productsFile, products);
      console.log('Product created in localStorage:', newProduct.name);
      return newProduct;
    } catch (error) {
      console.log('Product creation failed:', error.message);
      throw error;
    }
  }

  async findProductById(productId) {
    try {
      const products = await this.getProducts();
      return products.find(product => product._id === productId);
    } catch (error) {
      console.log('Product find failed:', error.message);
      return null;
    }
  }

  async updateProductStock(productId, quantityUsed) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(product => product._id === productId);
      
      if (productIndex !== -1) {
        products[productIndex].stock -= quantityUsed;
        products[productIndex].updatedAt = new Date().toISOString();
        await this.writeFile(this.productsFile, products);
        console.log(`Product stock updated: ${products[productIndex].name}, new stock: ${products[productIndex].stock}`);
        return products[productIndex];
      }
      return null;
    } catch (error) {
      console.log('Product stock update failed:', error.message);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      const orders = await this.getOrders();
      const orderNumber = `ORD-${(orders.length + 1).toString().padStart(3, '0')}`;
      const newOrder = {
        _id: this.generateId(),
        orderNumber,
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      orders.push(newOrder);
      await this.writeFile(this.ordersFile, orders);
      console.log('Order created in localStorage:', newOrder.orderNumber);
      return newOrder;
    } catch (error) {
      console.log('Order creation failed:', error.message);
      throw error;
    }
  }
}

module.exports = LocalStorage;