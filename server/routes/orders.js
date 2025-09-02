const express = require('express');
const { Order, Product } = require('../models');
const { authenticateToken, adminOnly } = require('../middleware/auth-fallback');
const { validateOrder, validateId, validatePagination } = require('../middleware/validation');
const LocalStorage = require('../utils/localStorage');
const mongoose = require('mongoose');

const router = express.Router();
const localStorage = new LocalStorage();

// Check if we should use MongoDB or localStorage
const useLocalStorage = () => mongoose.connection.readyState !== 1;

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/orders
// @desc    Get all orders with pagination and filtering
// @access  Private
router.get('/', validatePagination, async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      console.log('Using localStorage fallback for orders listing');
      const orders = await localStorage.getOrders();
      
      // Basic filtering
      const search = req.query.search || '';
      const status = req.query.status;
      const paymentMethod = req.query.paymentMethod;
      
      let filteredOrders = orders;
      
      if (search) {
        filteredOrders = orders.filter(o => 
          o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.cashierName?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
      }
      
      if (paymentMethod) {
        filteredOrders = filteredOrders.filter(o => o.paymentMethod === paymentMethod);
      }
      
      // Non-admin users can only see their own orders
      if (req.user.role !== 'admin') {
        filteredOrders = filteredOrders.filter(o => o.cashier === req.user._id);
      }
      
      // Simple pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const paginatedOrders = filteredOrders.slice(skip, skip + limit);
      const totalPages = Math.ceil(filteredOrders.length / limit);
      
      res.json({
        success: true,
        data: {
          orders: paginatedOrders,
          pagination: {
            currentPage: page,
            totalPages,
            totalOrders: filteredOrders.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const paymentMethod = req.query.paymentMethod;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const cashierId = req.query.cashier;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { cashierName: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (cashierId) {
      filter.cashier = cashierId;
    }

    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin') {
      filter.cashier = req.user._id;
    }

    // Get orders with pagination
    const orders = await Order.find(filter)
      .populate('cashier', 'name email')
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      const { startDate, endDate } = req.query;
      
      const today = new Date();
      const start = startDate ? new Date(startDate) : new Date(today.setHours(0, 0, 0, 0));
      const end = endDate ? new Date(endDate) : new Date(today.setHours(23, 59, 59, 999));
      
      const stats = await localStorage.getOrderStats(start.toISOString(), end.toISOString());
      
      res.json({
        success: true,
        data: {
          period: { start, end },
          ...stats,
          paymentMethodStats: [],
          hourlySales: [],
          topProducts: []
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const { startDate, endDate } = req.query;
    
    // Default to today if no dates provided
    const today = new Date();
    const start = startDate ? new Date(startDate) : new Date(today.setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(today.setHours(23, 59, 59, 999));

    // Build filter for user role
    const baseFilter = {
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    };

    // Non-admin users can only see their own stats
    if (req.user.role !== 'admin') {
      baseFilter.cashier = req.user._id;
    }

    // Get sales analytics
    const salesData = await Order.getSalesAnalytics(start, end);

    // Get payment method breakdown
    const paymentStats = await Order.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } },
      { $sort: { total: -1 } }
    ]);

    // Get hourly sales (for today only)
    const isToday = start.toDateString() === end.toDateString() && 
                   start.toDateString() === new Date().toDateString();
    
    let hourlySales = [];
    if (isToday) {
      hourlySales = await Order.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            sales: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);
    }

    // Get top selling products for the period
    const topProducts = await Order.getTopSellingProducts(5, start, end);

    res.json({
      success: true,
      data: {
        period: { start, end },
        ...salesData,
        paymentMethodStats: paymentStats,
        hourlySales,
        topProducts
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/daily-sales
// @desc    Get daily sales summary
// @access  Private
router.get('/daily-sales', async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      
      const dailySales = await localStorage.getDailySales(targetDate);
      
      res.json({
        success: true,
        data: dailySales
      });
      return;
    }
    
    // Original MongoDB implementation
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Build filter for user role
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    };

    // Non-admin users can only see their own sales
    if (req.user.role !== 'admin') {
      filter.cashier = req.user._id;
    }

    const dailySales = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    const result = dailySales[0] || {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalItems: 0
    };

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        ...result
      }
    });

  } catch (error) {
    console.error('Get daily sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', validateId, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'name email')
      .populate('items.product', 'name category sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Non-admin users can only view their own orders
    if (req.user.role !== 'admin' && order.cashier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', validateOrder, async (req, res) => {
  try {
    const { items, paymentMethod, customer, notes, discount = {}, tax = {} } = req.body;

    if (useLocalStorage()) {
      console.log('Using localStorage fallback for order creation');
      
      // Validate and calculate order using localStorage
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await localStorage.findProductById(item.product);
        
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product with ID ${item.product} not found`
          });
        }

        if (!product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product "${product.name}" is not available`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          product: product._id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          discount: item.discount || 0
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * (discount.percentage || 0)) / 100;
      } else if (discount.type === 'fixed') {
        discountAmount = discount.amount || 0;
      }

      const afterDiscount = subtotal - discountAmount;

      // Calculate tax
      let taxAmount = 0;
      if (tax.percentage) {
        taxAmount = (afterDiscount * tax.percentage) / 100;
      } else {
        taxAmount = tax.amount || 0;
      }

      const total = afterDiscount + taxAmount;

      // Create order using localStorage
      const orderData = {
        items: orderItems,
        subtotal,
        discount: {
          amount: discountAmount,
          percentage: discount.percentage || 0,
          type: discount.type || 'percentage'
        },
        tax: {
          amount: taxAmount,
          percentage: tax.percentage || 0
        },
        total,
        paymentMethod,
        status: 'completed',
        cashier: req.user._id,
        cashierName: req.user.name,
        customer: customer || {},
        notes: notes || ''
      };

      const newOrder = await localStorage.createOrder(orderData);

      // Update product stock
      for (const item of items) {
        await localStorage.updateProductStock(item.product, item.quantity);
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order: newOrder
        }
      });
      return;
    }

    // Original MongoDB implementation
    // Validate and calculate order
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        discount: item.discount || 0
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * (discount.percentage || 0)) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = discount.amount || 0;
    }

    const afterDiscount = subtotal - discountAmount;

    // Calculate tax
    let taxAmount = 0;
    if (tax.percentage) {
      taxAmount = (afterDiscount * tax.percentage) / 100;
    } else {
      taxAmount = tax.amount || 0;
    }

    const total = afterDiscount + taxAmount;

    // Create order
    const newOrder = new Order({
      items: orderItems,
      subtotal,
      discount: {
        amount: discountAmount,
        percentage: discount.percentage || 0,
        type: discount.type || 'percentage'
      },
      tax: {
        amount: taxAmount,
        percentage: tax.percentage || 0
      },
      total,
      paymentMethod,
      cashier: req.user._id,
      cashierName: req.user.name,
      customer: customer || {},
      notes: notes || ''
    });

    await newOrder.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate the created order
    await newOrder.populate('cashier', 'name email');
    await newOrder.populate('items.product', 'name category sku');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: newOrder,
        receipt: newOrder.getReceiptData()
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id/receipt
// @desc    Get order receipt data
// @access  Private
router.get('/:id/receipt', validateId, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'name email')
      .populate('items.product', 'name category sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Non-admin users can only view their own order receipts
    if (req.user.role !== 'admin' && order.cashier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const receiptData = order.getReceiptData();

    res.json({
      success: true,
      data: {
        receipt: receiptData
      }
    });

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders/:id/refund
// @desc    Process order refund (Admin only)
// @access  Private (Admin)
router.post('/:id/refund', validateId, adminOnly, async (req, res) => {
  try {
    const { amount, reason, restoreStock = true } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been refunded'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund a cancelled order'
      });
    }

    const refundAmount = amount || order.total;

    if (refundAmount > order.total) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }

    // Update order
    order.status = 'refunded';
    order.refund = {
      amount: refundAmount,
      reason: reason || 'Refund processed',
      refundedBy: req.user._id,
      refundedAt: new Date()
    };

    await order.save();

    // Restore stock if requested
    if (restoreStock) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    res.json({
      success: true,
      message: 'Order refunded successfully',
      data: {
        order,
        refundAmount,
        stockRestored: restoreStock
      }
    });

  } catch (error) {
    console.error('Refund order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', validateId, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['completed', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: completed, cancelled, or refunded'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;