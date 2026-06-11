const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

const isCustomer = (req) => req.user && req.user.role === 'customer';

const normalizeOrderItems = (items = []) =>
  items.map((item) => ({
    id: String(item.id ?? item.productId ?? item._id),
    name: item.name,
    price: Number(item.price) || 0,
    pricePerKg: item.pricePerKg,
    image: item.image,
    quantity: Number(item.quantity) || 1,
    total: Number(item.total) || (Number(item.price) || 0) * (Number(item.quantity) || 1),
  }));

const serializeOrder = (order) => ({
  ...order.toObject(),
  id: order.orderNumber,
  date: order.createdAt,
});

const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

// @route   GET /api/orders
// @desc    Get current customer's orders
// @access  Private (customer)
router.get('/', protect, async (req, res) => {
  try {
    if (!isCustomer(req)) {
      return res.status(403).json({ success: false, message: 'Only customers can view order history' });
    }

    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders.map(serializeOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get a single order for the current customer
// @access  Private (customer)
router.get('/:id', protect, async (req, res) => {
  try {
    if (!isCustomer(req)) {
      return res.status(403).json({ success: false, message: 'Only customers can view orders' });
    }

    const order = await Order.findOne({
      orderNumber: req.params.id,
      customerId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a customer order from the cart
// @access  Private (customer)
router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  ],
  async (req, res) => {
    try {
      if (!isCustomer(req)) {
        return res.status(403).json({ success: false, message: 'Only customers can place orders' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { items, deliveryAddress, contactPhone } = req.body;
      const deliveryFee = Number(req.body.deliveryFee ?? 200);
      const normalizedItems = normalizeOrderItems(items);
      const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
      const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
      const total = subtotal + deliveryFee;
      const orderNumber = generateOrderNumber();

      const order = await Order.create({
        orderNumber,
        customerId: req.user._id,
        items: normalizedItems,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: contactPhone.trim(),
        status: 'Processing',
      });

      const customer = await Customer.findById(req.user._id);
      if (customer) {
        const pointsEarned = Math.floor(total / 100);
        customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
        customer.totalPurchases = (customer.totalPurchases || 0) + total;
        customer.lastPurchase = new Date();
        await customer.save();
      }

      res.status(201).json({ success: true, data: serializeOrder(order) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;