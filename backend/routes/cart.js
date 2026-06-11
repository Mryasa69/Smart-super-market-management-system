const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

const upsertCart = async (customerId, items) => {
  return Cart.findOneAndUpdate(
    { customerId },
    { $set: { items } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

// @route   GET /api/cart
// @desc    Get current customer's cart
// @access  Private (Customer)
router.get('/', protect, async (req, res) => {
  try {
    console.log('[Cart GET] User:', req.user._id, 'Role:', req.user.role);
    const cart = await upsertCart(req.user._id, []);
    console.log('[Cart GET] Ensured cart exists for user:', req.user._id);
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart GET] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart
// @desc    Save/Update customer's cart
// @access  Private (Customer)
router.post('/', protect, async (req, res) => {
  try {
    const { items } = req.body;
    console.log('[Cart POST] User:', req.user._id, 'Role:', req.user.role, 'Items count:', items?.length);
    const cart = await upsertCart(req.user._id, items || []);
    console.log('[Cart POST] Saved cart for user:', req.user._id);
    
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart POST] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

