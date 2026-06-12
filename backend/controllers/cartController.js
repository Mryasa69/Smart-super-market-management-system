const Cart = require('../models/Cart');

// @desc    Get current customer's cart (READ ONLY — never overwrites items)
// @route   GET /api/cart
// @access  Private (Customer)
exports.getCart = async (req, res) => {
  try {
    console.log('[Cart GET] User:', req.user._id, 'Role:', req.user.role);
    // Use findOne — do NOT upsert with [] which would clear the cart
    const cart = await Cart.findOne({ customerId: req.user._id });
    console.log('[Cart GET] Found cart for user:', req.user._id, 'items:', cart?.items?.length ?? 0);
    // Return the existing cart, or an empty structure if none exists yet
    res.json({
      success: true,
      data: cart || { customerId: req.user._id, items: [] },
    });
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
    const cart = await Cart.findOneAndUpdate(
      { customerId: req.user._id },
      { $set: { items: items || [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log('[Cart POST] Saved cart for user:', req.user._id);
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('[Cart POST] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
