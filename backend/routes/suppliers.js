const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

// @route   GET /api/suppliers
router.get('/', protect, getSuppliers);

// @route   GET /api/suppliers/:id
router.get('/:id', protect, getSupplierById);

// @route   POST /api/suppliers
router.post(
  '/',
  protect,
  authorize('admin', 'stock_manager'),
  [
    body('name').trim().notEmpty().withMessage('Supplier name is required'),
    body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  createSupplier
);

// @route   PUT /api/suppliers/:id
router.put('/:id', protect, authorize('admin', 'stock_manager'), updateSupplier);

// @route   DELETE /api/suppliers/:id
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

module.exports = router;
