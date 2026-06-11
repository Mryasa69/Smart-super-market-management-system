const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} = require('../controllers/purchaseOrderController');

// @route   GET /api/purchase-orders
router.get('/', protect, getPurchaseOrders);

// @route   GET /api/purchase-orders/:id
router.get('/:id', protect, getPurchaseOrderById);

// @route   POST /api/purchase-orders
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
  createPurchaseOrder
);

// @route   PUT /api/purchase-orders/:id
router.put('/:id', protect, authorize('admin', 'stock_manager'), updatePurchaseOrder);

// @route   DELETE /api/purchase-orders/:id
router.delete('/:id', protect, authorize('admin'), deletePurchaseOrder);

module.exports = router;
