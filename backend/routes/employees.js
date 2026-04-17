const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees with filters
// @access  Private (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private (admin)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/employees
// @desc    Create an employee (also creates user account)
// @access  Private (admin)
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
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, phone, role, joinDate, password } = req.body;

      // Check if employee with this email exists
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
      }

      // Create employee record
      const employee = await Employee.create({
        name,
        email,
        phone,
        role,
        joinDate: joinDate || new Date(),
      });

      // Also create a User account for login
      const nameParts = name.split(' ');
      const userRole = role === 'Admin' ? 'admin' : role === 'Stock Manager' ? 'stock_manager' : 'cashier';

      await User.create({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        email,
        password,
        role: userRole,
      });

      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/employees/:id
// @desc    Update an employee
// @access  Private (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('Updating employee with ID:', req.params.id);
    console.log('Request body:', req.body);
    
    // Only allow updating valid fields
    const { name, email, phone, role, joinDate, status } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (joinDate !== undefined) updateData.joinDate = joinDate;
    if (status !== undefined) updateData.status = status;
    
    console.log('Filtered update data:', updateData);
    
    const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    console.log('Updated employee:', employee);
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/employees/:id/toggle-status
// @desc    Toggle employee active/inactive status
// @access  Private (admin)
router.patch('/:id/toggle-status', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    await employee.save();

    // Also toggle the user account
    await User.findOneAndUpdate({ email: employee.email }, { isActive: employee.status === 'active' });

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete an employee
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Also delete the associated user account
    await User.findOneAndDelete({ email: employee.email });
    await employee.deleteOne();
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
