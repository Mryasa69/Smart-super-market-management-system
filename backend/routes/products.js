const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts,
  getWeeklyDeals,
  getProductById,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct,
  cleanupWeeklyDeals,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

// Public routes
router.get('/weekly-deals', getWeeklyDeals);
router.get('/', getProducts);

// IMPORTANT: parameterized routes must come AFTER specific named routes,
// otherwise '/stats/overview' and '/cleanup-weekly-deals' could be matched as ':id'.
router.get('/stats/overview', protect, getProductStats);
router.post('/cleanup-weekly-deals', protect, cleanupWeeklyDeals);
router.get('/:id', getProductById);

// Protected routes
router.post(
  '/',
  protect,
  authorize('admin', 'stock_manager'),
  productValidation,
  createProduct
);
router.put(
  '/:id',
  protect,
  authorize('admin', 'stock_manager'),
  updateProduct
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

module.exports = router;