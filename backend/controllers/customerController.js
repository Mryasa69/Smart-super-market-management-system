const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

// @desc    Get current customer profile (for logged-in customers)
// @route   GET /api/customers/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // For customers, find by email from user token
    if (req.user.role === 'customer') {
      let customer = await Customer.findOne({ email: req.user.email });
      
      // If no customer record exists, create one from user data
      if (!customer) {
        const fullName = `${req.user.firstName} ${req.user.lastName}`;
        customer = await Customer.create({
          name: fullName,
          email: req.user.email,
          phone: '+94 11 234 5678', // Default phone number since it's required
          loyaltyPoints: 0,
          totalPurchases: 0,
          tier: 'Bronze'
        });
      }
      
      return res.json({ success: true, data: customer });
    }
    
    // For other roles, return user info
    res.json({ 
      success: true, 
      data: {
        _id: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error in /api/customers/me:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers with filters
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
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
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats/overview
// @access  Private
exports.getCustomerStats = async (req, res) => {
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
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private (admin, cashier)
exports.createCustomer = async (req, res) => {
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
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private (admin, cashier)
exports.updateCustomer = async (req, res) => {
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
};

// @desc    Add loyalty points to a customer
// @route   PATCH /api/customers/:id/add-points
// @access  Private
exports.addPoints = async (req, res) => {
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
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (admin)
exports.deleteCustomer = async (req, res) => {
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
};
