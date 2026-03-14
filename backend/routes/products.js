const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Private
router.get('/', protect, async (req, res) => {
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
});

// @route   GET /api/products/stats/overview
// @desc    Get product statistics
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
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
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (admin, stock_manager)
router.post(
  '/',
  protect,
  authorize('admin', 'stock_manager'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  async (req, res) => {
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

      const product = await Product.create({
        name,
        category,
        sku,
        quantity: quantity || 0,
        price,
        minStock: minStock || 10,
        supplier: supplier || '',
        barcode: barcode || sku,
        specialOffers: specialOffers === true,
        weeklyDeals: weeklyDeals === true,
        weeklyDealsAddedAt: weeklyDeals === true ? new Date() : null,
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (admin, stock_manager)
router.put('/:id', protect, authorize('admin', 'stock_manager'), async (req, res) => {
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
    
    // Handle weeklyDeals and timestamp logic
    if (weeklyDeals !== undefined) {
      if (weeklyDeals === true && product.weeklyDeals !== true) {
        // Product is being added to weekly deals for the first time
        product.weeklyDeals = true;
        product.weeklyDealsAddedAt = new Date();
      } else if (weeklyDeals === false) {
        // Product is being removed from weekly deals
        product.weeklyDeals = false;
        product.weeklyDealsAddedAt = null;
      }
      // If weeklyDeals is true and was already true, don't change the timestamp
    }

    await product.save(); // This triggers the pre-save hook for status

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products/cleanup-weekly-deals
// @desc    Remove products from weekly deals after 7 days
// @access  Private (admin, stock_manager)
router.post('/cleanup-weekly-deals', protect, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find all products that have been in weekly deals for more than 7 days
    const expiredDeals = await Product.find({
      weeklyDeals: true,
      weeklyDealsAddedAt: { $lt: sevenDaysAgo }
    });

    // Remove expired weekly deals
    const result = await Product.updateMany(
      {
        weeklyDeals: true,
        weeklyDealsAddedAt: { $lt: sevenDaysAgo }
      },
      {
        $set: {
          weeklyDeals: false,
          weeklyDealsAddedAt: null
        }
      }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired weekly deals`);

    res.json({
      success: true,
      message: `Removed ${result.modifiedCount} products from weekly deals`,
      removedProducts: expiredDeals.map(p => ({
        id: p._id,
        name: p.name,
        daysInWeeklyDeals: Math.floor((new Date() - p.weeklyDealsAddedAt) / (1000 * 60 * 60 * 24))
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
