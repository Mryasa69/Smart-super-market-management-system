const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardData,
  getDashboardOverview,
  getSalesChart,
  getWeeklySales,
  getCategorySales
} = require('../controllers/dashboardController');

// @route   GET /api/dashboard
router.get('/', protect, getDashboardData);

// @route   GET /api/dashboard/overview
router.get('/overview', protect, getDashboardOverview);

// @route   GET /api/dashboard/sales-chart
router.get('/sales-chart', protect, getSalesChart);

// @route   GET /api/dashboard/weekly-sales
router.get('/weekly-sales', protect, getWeeklySales);

// @route   GET /api/dashboard/category-sales
router.get('/category-sales', protect, getCategorySales);

module.exports = router;
