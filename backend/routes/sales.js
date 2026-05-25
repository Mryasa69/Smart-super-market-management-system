const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, page = 1, limit = 50 } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('cashier', 'firstName lastName')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: sales.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sales/stats/today
// @desc    Get today's sales statistics
// @access  Private
router.get('/stats/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = todaySales.length;

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('cashier', 'firstName lastName')
      .populate('customerId', 'name email');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/sales
// @desc    Create a sale (POS checkout)
// @access  Private (admin, cashier)
router.post(
  '/',
  protect,
  authorize('admin', 'cashier'),
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('total').isNumeric().withMessage('Total is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { items, subtotal, discountPercent, discountAmount, total, paymentMethod, customerId } = req.body;

      // Create the sale
      const sale = await Sale.create({
        items,
        subtotal,
        discountPercent: discountPercent || 0,
        discountAmount: discountAmount || 0,
        total,
        paymentMethod,
        cashier: req.user._id,
        customerId: customerId || null,
      });

      // Update product quantities (decrease stock)
      for (const item of items) {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.quantity = Math.max(0, product.quantity - item.quantity);
            await product.save(); // Triggers status recalculation
          }
        }
      }

      // If customer is linked, update their loyalty points and purchases
      if (customerId) {
        const customer = await Customer.findById(customerId);
        if (customer) {
          // Earn 1 loyalty point per Rs. 100 spent
          const pointsEarned = Math.floor(total / 100);
          customer.loyaltyPoints += pointsEarned;
          customer.totalPurchases += total;
          customer.lastPurchase = new Date();
          await customer.save(); // Triggers tier recalculation
        }
      }

      const populatedSale = await Sale.findById(sale._id)
        .populate('cashier', 'firstName lastName')
        .populate('customerId', 'name email');

      res.status(201).json({ success: true, data: populatedSale });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
