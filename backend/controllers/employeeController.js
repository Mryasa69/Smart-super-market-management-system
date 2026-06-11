const Employee = require('../models/Employee');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  Private (admin)
exports.getEmployees = async (req, res) => {
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
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private (admin)
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an employee (also creates user account)
// @route   POST /api/employees
// @access  Private (admin)
exports.createEmployee = async (req, res) => {
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
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (admin)
exports.updateEmployee = async (req, res) => {
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
};

// @desc    Toggle employee active/inactive status
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private (admin)
exports.toggleStatus = async (req, res) => {
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
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (admin)
exports.deleteEmployee = async (req, res) => {
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
};
