const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  isStrongPassword,
  register,
  login,
  registerCustomer,
  getMe
} = require('../controllers/authController');

const strongPasswordValidation = body('password')
  .custom((value) => isStrongPassword(value))
  .withMessage(
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
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

// @route   POST /api/auth/register-customer
router.post(
  '/register-customer',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    strongPasswordValidation,
    body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  ],
  registerCustomer
);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
