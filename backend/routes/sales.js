const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getSales,
  getTodayStats,
  getSaleById,
  createSale
} = require('../controllers/salesController');

// @route   GET /api/sales
router.get('/', protect, getSales);

// @route   GET /api/sales/stats/today
router.get('/stats/today', protect, getTodayStats);

// @route   GET /api/sales/:id
router.get('/:id', protect, getSaleById);

// @route   POST /api/sales
router.post(
  '/',
  protect,
  authorize('admin', 'cashier'),
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('total').isNumeric().withMessage('Total is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  createSale
);

module.exports = router;
