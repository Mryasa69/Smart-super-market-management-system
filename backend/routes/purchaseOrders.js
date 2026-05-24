const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, supplierId } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (supplierId) {
      query.supplierId = supplierId;
    }

    const orders = await PurchaseOrder.find(query)
      .populate('supplierId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/purchase-orders/:id
// @desc    Get single purchase order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate('supplierId', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/purchase-orders
// @desc    Create a purchase order
// @access  Private (admin, stock_manager)
router.post(
  '/',
  protect,
  authorize('admin', 'stock_manager'),
  [
    body('supplierId').notEmpty().withMessage('Supplier is required'),
    body('expectedDelivery').notEmpty().withMessage('Expected delivery date is required'),
    body('totalAmount').isNumeric().withMessage('Total amount is required'),
    body('items').isNumeric().withMessage('Number of items is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const order = await PurchaseOrder.create(req.body);

      // Update supplier's order count
      await Supplier.findByIdAndUpdate(req.body.supplierId, {
        $inc: { totalOrders: 1, activeOrders: 1 },
      });

      const populatedOrder = await PurchaseOrder.findById(order._id).populate('supplierId', 'name email phone');

      res.status(201).json({ success: true, data: populatedOrder });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/purchase-orders/:id
// @desc    Update a purchase order (status, etc.)
// @access  Private (admin, stock_manager)
router.put('/:id', protect, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const oldStatus = order.status;
    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('supplierId', 'name email phone');

    // If status changed to delivered or cancelled, decrease active orders
    if (req.body.status && req.body.status !== oldStatus) {
      if (req.body.status === 'delivered') {
        await Supplier.findByIdAndUpdate(order.supplierId, {
          $inc: { activeOrders: -1 },
          lastDelivery: new Date(),
        });
      } else if (req.body.status === 'cancelled') {
        await Supplier.findByIdAndUpdate(order.supplierId, {
          $inc: { activeOrders: -1 },
        });
      }
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/purchase-orders/:id
// @desc    Delete a purchase order
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
