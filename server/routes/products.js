const express = require('express');
const { Product } = require('../models');
const { authenticateToken, adminOnly } = require('../middleware/auth-fallback');
const { validateProduct, validateProductUpdate, validateId, validatePagination } = require('../middleware/validation');
const LocalStorage = require('../utils/localStorage');
const mongoose = require('mongoose');

const router = express.Router();
const localStorage = new LocalStorage();

// Check if we should use MongoDB or localStorage
const useLocalStorage = () => mongoose.connection.readyState !== 1;

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/products
// @desc    Get all products with pagination and filtering
// @access  Private
router.get('/', validatePagination, async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      console.log('Using localStorage fallback for products listing');
      const products = await localStorage.getProducts();
      
      // Basic filtering
      const search = req.query.search || '';
      const category = req.query.category;
      const isActive = req.query.isActive;
      
      let filteredProducts = products;
      
      if (search) {
        filteredProducts = products.filter(p => 
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()) ||
          p.sku?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      if (isActive !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.isActive === (isActive === 'true'));
      }
      
      // Simple pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const paginatedProducts = filteredProducts.slice(skip, skip + limit);
      const totalPages = Math.ceil(filteredProducts.length / limit);
      
      res.json({
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: filteredProducts.length,
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
    const category = req.query.category;
    const isActive = req.query.isActive;
    const lowStock = req.query.lowStock === 'true';
    const outOfStock = req.query.outOfStock === 'true';

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (lowStock) {
      filter.$expr = { $lte: ['$stock', '$minStock'] };
    }
    
    if (outOfStock) {
      filter.stock = { $lte: 0 };
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/stats
// @desc    Get product statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      const stats = await localStorage.getProductStats();
      
      res.json({
        success: true,
        data: {
          totalProducts: stats.totalProducts,
          activeProducts: stats.activeProducts,
          inactiveProducts: stats.totalProducts - stats.activeProducts,
          lowStockProducts: stats.lowStockProducts,
          outOfStockProducts: 0,
          categoryStats: [],
          totalInventoryValue: 0
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    });
    const outOfStockProducts = await Product.countDocuments({
      stock: { $lte: 0 },
      isActive: true
    });

    // Get category distribution
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        lowStockProducts,
        outOfStockProducts,
        categoryStats,
        totalInventoryValue: inventoryValue[0]?.totalValue || 0
      }
    });

  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Private
router.get('/categories', async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      console.log('Using localStorage fallback for categories');
      const products = await localStorage.getProducts();
      const categories = [...new Set(products.filter(p => p.isActive).map(p => p.category).filter(Boolean))].sort();
      
      res.json({
        success: true,
        data: {
          categories
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: {
        categories: categories.sort()
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      const lowStockProducts = await localStorage.getLowStockProducts();
      
      res.json({
        success: true,
        data: {
          products: lowStockProducts
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    })
    .populate('createdBy', 'name email')
    .sort({ stock: 1 });

    res.json({
      success: true,
      data: {
        products: lowStockProducts
      }
    });

  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/search
// @desc    Search products by name, SKU, or barcode
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const products = await Product.searchProducts(q.trim())
      .limit(20)
      .select('name price stock sku barcode category');

    res.json({
      success: true,
      data: {
        products
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', validateId, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product (Admin only)
// @access  Private (Admin)
router.post('/', adminOnly, validateProduct, async (req, res) => {
  try {
    if (useLocalStorage()) {
      // Use localStorage fallback
      console.log('Using localStorage fallback for product creation');
      const productData = {
        ...req.body,
        createdBy: req.user._id,
        isActive: true
      };
      
      const newProduct = await localStorage.createProduct(productData);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          product: newProduct
        }
      });
      return;
    }
    
    // Original MongoDB implementation
    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    // Populate the created product
    await newProduct.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: newProduct
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.toUpperCase()} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private (Admin)
router.put('/:id', validateId, adminOnly, validateProductUpdate, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.toUpperCase()} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private (Admin)
router.delete('/:id', validateId, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/:id/toggle-status
// @desc    Toggle product active status (Admin only)
// @access  Private (Admin)
router.post('/:id/toggle-status', validateId, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/:id/update-stock
// @desc    Update product stock (Admin only)
// @access  Private (Admin)
router.post('/:id/update-stock', validateId, adminOnly, async (req, res) => {
  try {
    const { quantity, operation = 'add', reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be either "add" or "subtract"'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (operation === 'subtract' && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Update stock
    if (operation === 'add') {
      product.stock += quantity;
    } else {
      product.stock -= quantity;
    }

    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: `Stock ${operation === 'add' ? 'added' : 'removed'} successfully`,
      data: {
        product,
        stockChange: {
          operation,
          quantity,
          reason: reason || `Manual stock ${operation}`,
          updatedBy: req.user.name,
          updatedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;