const Cart = require('../models/Cart');

const upsertCart = async (customerId, items) => {
  return Cart.findOneAndUpdate(
    { customerId },
    { $set: { items } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

// @desc    Get current customer's cart
// @route   GET /api/cart
// @access  Private (Customer)
exports.getCart = async (req, res) => {
  try {
    console.log('[Cart GET] User:', req.user._id, 'Role:', req.user.role);
    const cart = await upsertCart(req.user._id, []);
    console.log('[Cart GET] Ensured cart exists for user:', req.user._id);
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart GET] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update customer's cart
// @route   POST /api/cart
// @access  Private (Customer)
exports.saveCart = async (req, res) => {
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
};
