const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  validatePassword,
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile
} = require('../controllers/customerAuthController');

// @route   POST /api/customer-auth/register
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
], register);

// @route   POST /api/customer-auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// @route   POST /api/customer-auth/google-login
router.post('/google-login', [
  body('accessToken').notEmpty().withMessage('Google access token is required'),
], googleLogin);

// @route   GET /api/customer-auth/profile
router.get('/profile', protect, getProfile);

// @route   PUT /api/customer-auth/profile
router.put('/profile', protect, updateProfile);

module.exports = router;
