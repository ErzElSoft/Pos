const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test configuration
let authToken = null;
let testUserId = null;
let testProductId = null;
let testOrderId = null;

// API client setup
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test data
const testAdmin = {
  email: 'admin@pos.com',
  password: 'adminHell0!@#'
};

const testProduct = {
  name: 'Test Product API',
  description: 'Product created for API testing',
  price: 29.99,
  category: 'Test Category',
  stock: 100,
  sku: 'TEST-API-001'
};

const testUser = {
  name: 'Test Cashier API',
  email: 'testcashier@pos.com',
  password: 'adminHell0!@#',
  role: 'cashier'
};

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await api.get('/health');
    console.log('✅ Health check passed:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  try {
    // Login
    const loginResponse = await api.post('/auth/login', testAdmin);
    authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Get profile
    const profileResponse = await api.get('/auth/me');
    console.log('✅ Profile fetch successful:', profileResponse.data.data.user.name);

    return true;
  } catch (error) {
    console.log('❌ Auth test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUsers() {
  console.log('\n👥 Testing User Management...');
  try {
    // Create user
    const createResponse = await api.post('/auth/register', testUser);
    testUserId = createResponse.data.data.user._id;
    console.log('✅ User created successfully');

    // Get users
    const usersResponse = await api.get('/users');
    console.log('✅ Users fetched successfully:', usersResponse.data.data.users.length, 'users');

    // Get user stats
    const statsResponse = await api.get('/users/stats');
    console.log('✅ User stats fetched successfully');

    // Update user
    const updateResponse = await api.put(`/users/${testUserId}`, {
      name: 'Updated Test Cashier'
    });
    console.log('✅ User updated successfully');

    return true;
  } catch (error) {
    console.log('❌ User test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProducts() {
  console.log('\n📦 Testing Product Management...');
  try {
    // Create product
    const createResponse = await api.post('/products', testProduct);
    testProductId = createResponse.data.data.product._id;
    console.log('✅ Product created successfully');

    // Get products
    const productsResponse = await api.get('/products');
    console.log('✅ Products fetched successfully:', productsResponse.data.data.products.length, 'products');

    // Get product stats
    const statsResponse = await api.get('/products/stats');
    console.log('✅ Product stats fetched successfully');

    // Update product
    const updateResponse = await api.put(`/products/${testProductId}`, {
      name: 'Updated Test Product API'
    });
    console.log('✅ Product updated successfully');

    // Get categories
    const categoriesResponse = await api.get('/products/categories');
    console.log('✅ Categories fetched successfully');

    return true;
  } catch (error) {
    console.log('❌ Product test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testOrders() {
  console.log('\n🛒 Testing Order Management...');
  try {
    if (!testProductId) {
      console.log('❌ Cannot test orders without a test product');
      return false;
    }

    // Create order
    const orderData = {
      items: [{
        product: testProductId,
        quantity: 2
      }],
      paymentMethod: 'cash',
      customer: {
        name: 'Test Customer',
        email: 'test@customer.com'
      }
    };

    const createResponse = await api.post('/orders', orderData);
    testOrderId = createResponse.data.data.order._id;
    console.log('✅ Order created successfully:', createResponse.data.data.order.orderNumber);

    // Get orders
    const ordersResponse = await api.get('/orders');
    console.log('✅ Orders fetched successfully:', ordersResponse.data.data.orders.length, 'orders');

    // Get order stats
    const statsResponse = await api.get('/orders/stats');
    console.log('✅ Order stats fetched successfully');

    // Get daily sales
    const salesResponse = await api.get('/orders/daily-sales');
    console.log('✅ Daily sales fetched successfully');

    // Get order receipt
    const receiptResponse = await api.get(`/orders/${testOrderId}/receipt`);
    console.log('✅ Order receipt fetched successfully');

    return true;
  } catch (error) {
    console.log('❌ Order test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    // Delete test user
    if (testUserId) {
      await api.delete(`/users/${testUserId}`);
      console.log('✅ Test user deleted');
    }

    // Delete test product
    if (testProductId) {
      await api.delete(`/products/${testProductId}`);
      console.log('✅ Test product deleted');
    }

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('⚠️ Cleanup had issues:', error.response?.data?.message || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting POS API Integration Tests...');
  console.log('='.repeat(50));

  let passedTests = 0;
  let totalTests = 0;

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Authentication', fn: testAuth },
    { name: 'User Management', fn: testUsers },
    { name: 'Product Management', fn: testProducts },
    { name: 'Order Management', fn: testOrders }
  ];

  for (const test of tests) {
    totalTests++;
    const result = await test.fn();
    if (result) passedTests++;
  }

  await cleanup();

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All API integration tests passed! The backend is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the server and database connection.');
  }
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testAuth,
  testUsers,
  testProducts,
  testOrders
};