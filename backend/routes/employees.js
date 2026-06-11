const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleStatus,
  deleteEmployee
} = require('../controllers/employeeController');

// @route   GET /api/employees
router.get('/', protect, authorize('admin'), getEmployees);

// @route   GET /api/employees/:id
router.get('/:id', protect, authorize('admin'), getEmployeeById);

// @route   POST /api/employees
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Employee name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  createEmployee
);

// @route   PUT /api/employees/:id
router.put('/:id', protect, authorize('admin'), updateEmployee);

// @route   PATCH /api/employees/:id/toggle-status
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleStatus);

// @route   DELETE /api/employees/:id
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
