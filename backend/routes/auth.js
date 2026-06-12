const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  isStrongPassword,
  register,
  login,
  registerCustomer,
  getMe,
  forgotPassword,
  resetPassword,
  sendAuthRegistrationOTP,
  verifyAuthRegistrationOTP
} = require('../controllers/authController');

const strongPasswordValidation = body('password')
  .custom((value) => isStrongPassword(value))
  .withMessage(
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  );

// @route   POST /api/auth/send-registration-otp
router.post(
  '/send-registration-otp',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  sendAuthRegistrationOTP
);

// @route   POST /api/auth/verify-registration-otp
router.post(
  '/verify-registration-otp',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('otp').trim().notEmpty().withMessage('OTP is required'),
  ],
  verifyAuthRegistrationOTP
);

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    strongPasswordValidation,
  ],
  register
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
  ],
  forgotPassword
);

// @route   POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  resetPassword
);

module.exports = router;
