const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/customers
// @desc    Get all customers with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, tier } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (tier && tier !== 'all') {
      query.tier = tier;
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/stats/overview
// @desc    Get customer statistics
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const customers = await Customer.find();

    const avgLoyaltyPoints =
      customers.length > 0
        ? Math.round(customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length)
        : 0;

    const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
    const platinumMembers = await Customer.countDocuments({ tier: 'Platinum' });

    res.json({
      success: true,
      data: { totalCustomers, avgLoyaltyPoints, totalRevenue, platinumMembers },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/customers
// @desc    Create a customer
// @access  Private (admin, cashier)
router.post(
  '/',
  protect,
  authorize('admin', 'cashier'),
  [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const existingCustomer = await Customer.findOne({ email: req.body.email });
      if (existingCustomer) {
        return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
      }

      const customer = await Customer.create(req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/customers/:id
// @desc    Update a customer
// @access  Private (admin, cashier)
router.put('/:id', protect, authorize('admin', 'cashier'), async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      customer[key] = req.body[key];
    });

    await customer.save(); // Triggers pre-save for tier calculation

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/customers/:id/add-points
// @desc    Add loyalty points to a customer
// @access  Private
router.patch('/:id/add-points', protect, async (req, res) => {
  try {
    const { points } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.loyaltyPoints += points || 0;
    await customer.save(); // Triggers tier recalculation

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete a customer
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.deleteOne();
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
