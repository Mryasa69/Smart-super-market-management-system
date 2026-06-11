const Product = require('../models/Product');
const Activity = require('../models/Activity');
const { addActivity } = require('../utils/activityTracker');
const { validationResult } = require('express-validator');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats/overview
// @access  Private
exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ status: 'in-stock' });
    const lowStock = await Product.countDocuments({ status: 'low-stock' });
    const outOfStock = await Product.countDocuments({ status: 'out-of-stock' });

    res.json({
      success: true,
      data: { totalProducts, inStock, lowStock, outOfStock },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (admin, stock_manager)
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, category, sku, quantity, price, minStock, supplier, barcode, specialOffers, weeklyDeals } = req.body;

    // Check if SKU already exists
    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists' });
    }

    const productData = {
      name,
      category,
      sku,
      quantity: quantity || 0,
      price,
      minStock: minStock || 10,
      supplier: supplier || '',
      barcode: barcode || sku,
      specialOffers: specialOffers || false,
      weeklyDeals: weeklyDeals || false,
    };

    // Add weeklyDealsAddedAt timestamp if weeklyDeals is true
    if (weeklyDeals) {
      productData.weeklyDealsAddedAt = new Date();
    }

    const product = await Product.create(productData);

    // Log activity using in-memory tracker
    addActivity(
      'product_created',
      `New product "${name}" added to inventory`,
      req.user.firstName + ' ' + req.user.lastName,
      `Rs. ${price}`,
      'Product',
      product._id
    );

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (admin, stock_manager)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, category, sku, quantity, price, minStock, supplier, barcode, specialOffers, weeklyDeals } = req.body;

    product.name = name || product.name;
    product.category = category || product.category;
    product.sku = sku || product.sku;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.price = price !== undefined ? price : product.price;
    product.minStock = minStock !== undefined ? minStock : product.minStock;
    product.supplier = supplier !== undefined ? supplier : product.supplier;
    product.barcode = barcode !== undefined ? barcode : product.barcode;
    product.specialOffers = specialOffers !== undefined ? specialOffers : product.specialOffers;
    
    // Handle weeklyDeals and timestamp
    if (weeklyDeals !== undefined) {
      product.weeklyDeals = weeklyDeals;
      if (weeklyDeals && !product.weeklyDealsAddedAt) {
        // If weeklyDeals is being set to true and no timestamp exists, add one
        product.weeklyDealsAddedAt = new Date();
      } else if (!weeklyDeals) {
        // If weeklyDeals is being set to false, clear the timestamp
        product.weeklyDealsAddedAt = null;
      }
    }

    await product.save(); // This triggers the pre-save hook for status

    // Log activity
    await Activity.create({
      action: 'product_updated',
      description: `Product "${name || product.name}" updated`,
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      amount: `Rs. ${price || product.price}`,
      entityType: 'Product',
      entityId: product._id
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productName = product.name;
    await product.deleteOne();
    
    // Log activity
    await Activity.create({
      action: 'product_deleted',
      description: `Product "${productName}" deleted from inventory`,
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      amount: 'Deleted',
      entityType: 'Product',
      entityId: product._id
    });
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove expired weekly deals (older than 7 days)
// @route   POST /api/products/cleanup-weekly-deals
// @access  Private (all roles can trigger this)
exports.cleanupWeeklyDeals = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expiredDeals = await Product.find({
      weeklyDeals: true,
      weeklyDealsAddedAt: { $lt: sevenDaysAgo }
    });

    const removedProducts = await Product.updateMany(
      {
        weeklyDeals: true,
        weeklyDealsAddedAt: { $lt: sevenDaysAgo }
      },
      {
        $unset: { weeklyDeals: 1, weeklyDealsAddedAt: 1 }
      }
    );

    res.json({
      success: true,
      message: `Cleaned up ${removedProducts.modifiedCount} expired weekly deals`,
      removedProducts: expiredDeals.map(p => ({ id: p._id, name: p.name }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
