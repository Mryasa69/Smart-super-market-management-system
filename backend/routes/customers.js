const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getMe,
  getCustomers,
  getCustomerStats,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addPoints,
  deleteCustomer
} = require('../controllers/customerController');

// @route   GET /api/customers/me
router.get('/me', protect, getMe);

// @route   GET /api/customers
router.get('/', protect, getCustomers);

// @route   GET /api/customers/stats/overview
router.get('/stats/overview', protect, getCustomerStats);

// @route   GET /api/customers/:id
router.get('/:id', protect, getCustomerById);

// @route   POST /api/customers
router.post(
  '/',
  protect,
  authorize('admin', 'cashier'),
  [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  createCustomer
);

// @route   PUT /api/customers/:id
router.put('/:id', protect, authorize('admin', 'cashier'), updateCustomer);

// @route   PATCH /api/customers/:id/add-points
router.patch('/:id/add-points', protect, addPoints);

// @route   DELETE /api/customers/:id
router.delete('/:id', protect, authorize('admin'), deleteCustomer);

module.exports = router;
