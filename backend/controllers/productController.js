const Product = require('../models/Product');
const Activity = require('../models/Activity');
const { addActivity } = require('../utils/activityTracker');
const { validationResult } = require('express-validator');

// How long a weekly deal lasts (7 days in milliseconds)
const WEEKLY_DEAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Auto-remove expired weekly deals from the database.
 * Returns the number of products removed.
 */
async function autoCleanupExpiredWeeklyDeals() {
  try {
    const expiryThreshold = new Date(Date.now() - WEEKLY_DEAL_DURATION_MS);
    const result = await Product.updateMany(
      {
        weeklyDeals: true,
        weeklyDealsAddedAt: { $ne: null, $lt: expiryThreshold },
      },
      {
        $set: { weeklyDeals: false },
        $unset: { weeklyDealsAddedAt: 1 },
      }
    );
    return result.modifiedCount || 0;
  } catch (err) {
    console.error('[autoCleanupExpiredWeeklyDeals] error:', err.message);
    return 0;
  }
}

/**
 * Returns the time left (in ms) for a product's weekly deal.
 * Returns 0 if the product is not a weekly deal or has already expired.
 */
function getWeeklyDealTimeLeft(product) {
  if (!product.weeklyDeals) return 0;
  if (!product.weeklyDealsAddedAt) {
    // If somehow weeklyDeals is true but no timestamp, give it a full 7 days
    return WEEKLY_DEAL_DURATION_MS;
  }
  const elapsed = Date.now() - new Date(product.weeklyDealsAddedAt).getTime();
  const remaining = WEEKLY_DEAL_DURATION_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // First, auto-cleanup any expired weekly deals so we don't show stale ones
    await autoCleanupExpiredWeeklyDeals();

    const { search, category, status, page = 1, limit = 50, onlyWeekly } = req.query;
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

    if (onlyWeekly === 'true') {
      query.weeklyDeals = true;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Attach a computed server time + time-left for each product
    const serverNow = new Date().toISOString();
    const data = products.map((p) => {
      const obj = p.toObject();
      obj.serverNow = serverNow;
      obj.weeklyDealsTimeLeft = getWeeklyDealTimeLeft(p);
      return obj;
    });

    res.json({
      success: true,
      count: data.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weekly deals (active, non-expired only) with time-left data
// @route   GET /api/products/weekly-deals
// @access  Public
exports.getWeeklyDeals = async (req, res) => {
  try {
    await autoCleanupExpiredWeeklyDeals();

    const expiryThreshold = new Date(Date.now() - WEEKLY_DEAL_DURATION_MS);
    const weeklyDeals = await Product.find({
      weeklyDeals: true,
      weeklyDealsAddedAt: { $gte: expiryThreshold },
    }).sort({ weeklyDealsAddedAt: -1 });

    const serverNow = new Date().toISOString();
    const data = weeklyDeals.map((p) => {
      const obj = p.toObject();
      obj.serverNow = serverNow;
      obj.weeklyDealsTimeLeft = getWeeklyDealTimeLeft(p);
      return obj;
    });

    res.json({
      success: true,
      count: data.length,
      serverNow,
      data,
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
    const obj = product.toObject();
    obj.serverNow = new Date().toISOString();
    obj.weeklyDealsTimeLeft = getWeeklyDealTimeLeft(product);
    res.json({ success: true, data: obj });
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

    const { name, category, sku, quantity, price, minStock, supplier, barcode, specialOffers, weeklyDeals, image } = req.body;

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
      image: image || '',
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

    const obj = product.toObject();
    obj.serverNow = new Date().toISOString();
    obj.weeklyDealsTimeLeft = getWeeklyDealTimeLeft(product);

    res.status(201).json({ success: true, data: obj });
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

    const { name, category, sku, quantity, price, minStock, supplier, barcode, specialOffers, weeklyDeals, image } = req.body;

    product.name = name || product.name;
    product.category = category || product.category;
    product.sku = sku || product.sku;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.price = price !== undefined ? price : product.price;
    product.minStock = minStock !== undefined ? minStock : product.minStock;
    product.supplier = supplier !== undefined ? supplier : product.supplier;
    product.barcode = barcode !== undefined ? barcode : product.barcode;
    product.specialOffers = specialOffers !== undefined ? specialOffers : product.specialOffers;
    product.image = image !== undefined ? image : product.image;

    // Handle weeklyDeals and timestamp
    if (weeklyDeals !== undefined) {
      const wasActive = product.weeklyDeals;
      product.weeklyDeals = weeklyDeals;

      if (weeklyDeals) {
        // Reset the timer each time the product is (re-)selected as a weekly deal
        product.weeklyDealsAddedAt = new Date();
      } else {
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

    const obj = product.toObject();
    obj.serverNow = new Date().toISOString();
    obj.weeklyDealsTimeLeft = getWeeklyDealTimeLeft(product);

    res.json({ success: true, data: obj });
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
    const sevenDaysAgo = new Date(Date.now() - WEEKLY_DEAL_DURATION_MS);

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
        $set: { weeklyDeals: false },
        $unset: { weeklyDealsAddedAt: 1 }
      }
    );

    res.json({
      success: true,
      message: `Cleaned up ${removedProducts.modifiedCount} expired weekly deals`,
      removedProducts: expiredDeals.map(p => ({ id: p._id, name: p.name })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export helpers for use by the scheduled job
exports.autoCleanupExpiredWeeklyDeals = autoCleanupExpiredWeeklyDeals;
exports.WEEKLY_DEAL_DURATION_MS = WEEKLY_DEAL_DURATION_MS;