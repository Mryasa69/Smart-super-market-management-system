const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCart, saveCart } = require('../controllers/cartController');

// @route   GET /api/cart
router.get('/', protect, getCart);

// @route   POST /api/cart
router.post('/', protect, saveCart);

module.exports = router;
