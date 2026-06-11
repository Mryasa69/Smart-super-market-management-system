const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateRandomPassword = () => {
  const base = Math.random().toString(36).slice(2);
  const stamp = Date.now().toString(36);
  return `Gg#${base}${stamp}A1!`;
};

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

exports.validatePassword = validatePassword;

// @desc    Register a new customer
// @route   POST /api/customer-auth/register
// @access  Public
exports.register = async (req, res) => {
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
};

// @desc    Login customer
// @route   POST /api/customer-auth/login
// @access  Public
exports.login = async (req, res) => {
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
};

// @desc    Login/register customer with Google OAuth access token
// @route   POST /api/customer-auth/google-login
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { accessToken } = req.body;

    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!googleRes.ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    const googleUser = await googleRes.json();

    if (!googleUser?.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is unavailable',
      });
    }

    let customer = await Customer.findOne({ email: googleUser.email });

    if (!customer) {
      customer = await Customer.create({
        name: googleUser.name || `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim() || 'Google Customer',
        email: googleUser.email,
        phone: `google-${(googleUser.sub || Date.now().toString()).slice(-10)}`,
        password: generateRandomPassword(),
        googleId: googleUser.sub || null,
        authProvider: 'google',
      });
    } else {
      let changed = false;
      if (!customer.googleId && googleUser.sub) {
        customer.googleId = googleUser.sub;
        changed = true;
      }
      if (customer.authProvider !== 'google') {
        customer.authProvider = 'google';
        changed = true;
      }
      if ((!customer.name || customer.name === 'Customer') && googleUser.name) {
        customer.name = googleUser.name;
        changed = true;
      }

      if (changed) {
        await customer.save();
      }
    }

    const token = jwt.sign(
      { id: customer._id, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          tier: customer.tier,
          loyaltyPoints: customer.loyaltyPoints,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get customer profile
// @route   GET /api/customer-auth/profile
// @access  Private (customer)
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customer-auth/profile
// @access  Private (customer)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, nicNumber } = req.body;
    
    // Find customer and update
    const customer = await Customer.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, nicNumber },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
