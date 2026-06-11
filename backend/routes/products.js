const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProductStats,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  cleanupWeeklyDeals
} = require('../controllers/productController');

// @route   GET /api/products
router.get('/', getProducts);

// @route   GET /api/products/stats/overview
router.get('/stats/overview', protect, getProductStats);

// @route   GET /api/products/:id
router.get('/:id', getProductById);

// @route   POST /api/products
router.post(
  '/',
  protect,
  authorize('admin', 'stock_manager'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  createProduct
);

// @route   PUT /api/products/:id
router.put('/:id', protect, authorize('admin', 'stock_manager'), updateProduct);

// @route   DELETE /api/products/:id
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// @route   POST /api/products/cleanup-weekly-deals
router.post('/cleanup-weekly-deals', protect, cleanupWeeklyDeals);

module.exports = router;
