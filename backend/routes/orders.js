const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getStripeConfig,
  createStripeOrder,
  verifyStripeOrder,
  getOrders,
  getOrderById,
  createOrder
} = require('../controllers/orderController');

// @route   GET /api/orders/stripe/config
router.get('/stripe/config', getStripeConfig);

// @route   POST /api/orders/stripe
router.post(
  '/stripe',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  ],
  createStripeOrder
);

// @route   POST /api/orders/stripe/verify
router.post('/stripe/verify', protect, verifyStripeOrder);

// @route   GET /api/orders
router.get('/', protect, getOrders);

// @route   GET /api/orders/:id
router.get('/:id', protect, getOrderById);

// @route   POST /api/orders
router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  ],
  createOrder
);

module.exports = router;