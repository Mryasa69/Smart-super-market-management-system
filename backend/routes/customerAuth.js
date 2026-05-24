const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Password validation function
const validatePassword = (password) => {
  const errors = [];
  
  // Minimum 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // At least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

// @route   POST /api/customer-auth/register
// @desc    Register a new customer
// @access   Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').custom((value) => {
    const errors = validatePassword(value);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    return true;
  }).withMessage('Password does not meet requirements'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: existingCustomer.email === email ? 'Email already registered' : 'Phone number already registered'
      });
    }

    // Create new customer
    const customer = await Customer.create({
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          tier: customer.tier,
          loyaltyPoints: customer.loyaltyPoints
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/customer-auth/login
// @desc    Login customer
// @access   Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find customer by email
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          tier: customer.tier,
          loyaltyPoints: customer.loyaltyPoints
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/customer-auth/profile
// @desc    Get customer profile
// @access   Private (customer)
router.get('/profile', async (req, res) => {
  try {
    // This would need customer authentication middleware
    res.json({
      success: true,
      message: 'This endpoint needs customer authentication middleware'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
