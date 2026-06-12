const Customer = require('../models/Customer');
const OTPVerification = require('../models/OTPVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/email');

const generateRandomPassword = () => {
  const base = Math.random().toString(36).slice(2);
  const stamp = Date.now().toString(36);
  return `Gg#${base}${stamp}A1!`;
};

// Password validation function
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

exports.validatePassword = validatePassword;

/** Generate a random 6-digit OTP string */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/** Build the styled HTML email body for OTP */
const buildOTPEmail = (name, otp) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
        <!-- header -->
        <tr>
          <td style="background:linear-gradient(135deg,#16a34a,#059669);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">🛒 Smart Supermarket</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Email Verification</p>
          </td>
        </tr>
        <!-- body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hi ${name ? `<strong>${name}</strong>` : 'there'},</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
              Please use the verification code below to confirm your email address.
              This code is valid for <strong>15 minutes</strong>.
            </p>
            <!-- OTP box -->
            <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:2px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <p style="font-size:12px;font-weight:700;color:#047857;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Your Verification Code</p>
              <p style="font-size:42px;font-weight:900;color:#16a34a;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">${otp}</p>
            </div>
            <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">
              If you did not request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="background:#f9fafb;padding:18px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© 2025 Smart Supermarket · Automated message, do not reply</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;


// @desc    Send registration OTP (before user creates account)
// @route   POST /api/customer-auth/send-registration-otp
// @access  Public
exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if customer already exists with this email
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate OTP and save to OTPVerification collection
    const otp = generateOTP();
    await OTPVerification.deleteMany({ email }); // Remove any existing unverified OTP for this email
    await OTPVerification.create({ email, otp, verified: false });

    // Send email
    try {
      await sendEmail({
        email,
        subject: '🔐 Verify your Smart Supermarket account',
        message: `Your verification code is: ${otp} (valid for 15 minutes)`,
        html: buildOTPEmail(name || '', otp),
      });
      console.log(`[OTP] Sent to ${email}: ${otp}`);
    } catch (emailErr) {
      console.error('[OTP] Email send failed:', emailErr.message);
      console.log(`[OTP DEV FALLBACK] Code for ${email}: ${otp}`);
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Verify registration OTP
// @route   POST /api/customer-auth/verify-registration-otp
// @access  Public
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const otpRecord = await OTPVerification.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Register a new customer (requires prior OTP verification)
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

    // Check if OTP was verified
    const otpRecord = await OTPVerification.findOne({ email, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email with an OTP before signing up.'
      });
    }

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

    // Create new verified customer
    const customer = await Customer.create({
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
      nicNumber: req.body.nicNumber || '',
      address: req.body.address || '',
      isVerified: true, // Verified during the OTP step!
    });

    // Cleanup OTP record
    await OTPVerification.deleteMany({ email });

    // Automatically log in the user
    const token = jwt.sign(
      { id: customer._id, type: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Smart Supermarket.',
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          tier: customer.tier,
          loyaltyPoints: customer.loyaltyPoints,
          profilePicture: customer.profilePicture || ''
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
          loyaltyPoints: customer.loyaltyPoints,
          profilePicture: customer.profilePicture || ''
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
        isVerified: true,
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
      if (!customer.isVerified) {
        customer.isVerified = true;
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
          profilePicture: customer.profilePicture || ''
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
    const { name, phone, address, nicNumber, profilePicture } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, nicNumber, profilePicture },
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
