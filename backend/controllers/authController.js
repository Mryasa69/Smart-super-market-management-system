const User = require('../models/User');
const Customer = require('../models/Customer');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Helper password strength checker
const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

exports.isStrongPassword = isStrongPassword;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, nic } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      nic: nic || '',
      role: 'customer', // Public signup creates customer accounts
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new customer
// @route   POST /api/auth/register-customer
// @access  Public
exports.registerCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create customer user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || '',
      role: 'customer',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password - generate reset token & email it
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    // Try finding staff User first, then Customer
    let user = await User.findOne({ email });

    if (!user) {
      user = await Customer.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please reset your password by visiting this link: \n\n ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #15803d; text-align: center;">Smart Supermarket Password Reset</h2>
        <p>You requested a password reset for your account. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #475569;">${resetUrl}</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Note: This link is only valid for 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Supermarket - Password Reset Request',
        message,
        html,
      });

      res.status(200).json({ success: true, message: 'Reset email sent successfully' });
    } catch (err) {
      console.error('Error sending reset email:', err);
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both token and password' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // Hash sent token and compare to stored hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user/customer with valid token and not expired
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      user = await Customer.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password (the model pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
