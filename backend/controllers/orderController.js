const Stripe = require('stripe');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

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
const getStripeSecretKey = () => process.env.STRIPE_SECRET_KEY || '';
const getStripeInstance = () => {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error('Stripe secret key is missing');
  }
  return new Stripe(secretKey);
};
const STRIPE_CURRENCY = 'lkr';

const calculatePoints = (amount) => Math.floor(Number(amount || 0) / 100);

const buildStripeLineItems = (items = [], deliveryFee = 0) => {
  const productLineItems = items.map((item) => ({
    price_data: {
      currency: STRIPE_CURRENCY,
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(Number(item.price || 0) * 100),
    },
    quantity: Number(item.quantity) || 1,
  }));

  if (deliveryFee > 0) {
    productLineItems.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: {
          name: 'Delivery Fee',
        },
        unit_amount: Math.round(Number(deliveryFee) * 100),
      },
      quantity: 1,
    });
  }

  return productLineItems;
};

const findCustomerOrder = async (orderId, customerId) => {
  return Order.findOne({ _id: orderId, customerId });
};

// @desc    Get Stripe publishable key for checkout
// @route   GET /api/orders/stripe/config
// @access  Public
exports.getStripeConfig = (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
  if (!publishableKey) {
    return res.status(500).json({ success: false, message: 'Stripe publishable key is missing' });
  }

  return res.json({ success: true, data: { publishableKey } });
};

// @desc    Create a customer order and Stripe checkout session
// @route   POST /api/orders/stripe
// @access  Private (customer)
exports.createStripeOrder = async (req, res) => {
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
    const stripe = getStripeInstance();
    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';

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
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
    });

    const lineItems = buildStripeLineItems(normalizedItems, deliveryFee);

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderId: order._id.toString(),
          customerId: req.user._id.toString(),
          orderNumber,
        },
      });
    } catch (sessionError) {
      await Order.findByIdAndDelete(order._id);
      throw sessionError;
    }

    await Order.findByIdAndUpdate(order._id, {
      stripeSessionId: session.id,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id.toString(),
        orderNumber,
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('[Stripe Order] Error creating checkout session:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Stripe payment and finalize the order
// @route   POST /api/orders/stripe/verify
// @access  Private (customer)
exports.verifyStripeOrder = async (req, res) => {
  try {
    if (!isCustomer(req)) {
      return res.status(403).json({ success: false, message: 'Only customers can verify orders' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Stripe session does not contain an order reference' });
    }

    const order = await findCustomerOrder(orderId, req.user._id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (session.payment_status === 'paid') {
      const alreadyPaid = order.paymentStatus === 'paid';
      order.paymentStatus = 'paid';
      order.status = 'Confirmed';
      order.stripeSessionId = session.id;
      order.stripePaymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;
      order.paidAt = order.paidAt || new Date();
      await order.save();

      if (!alreadyPaid) {
        const customer = await Customer.findById(req.user._id);
        if (customer) {
          const pointsEarned = calculatePoints(order.total);
          customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
          customer.totalPurchases = (customer.totalPurchases || 0) + order.total;
          customer.lastPurchase = new Date();
          if (order.contactPhone?.trim()) {
            customer.phone = order.contactPhone.trim();
          }
          await customer.save();
        }
      }
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(202).json({
        success: false,
        message: 'Payment has not completed yet',
        data: serializeOrder(order),
      });
    }

    res.json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    console.error('[Stripe Order] Verification failed:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current customer's orders
// @route   GET /api/orders
// @access  Private (customer)
exports.getOrders = async (req, res) => {
  try {
    if (!isCustomer(req)) {
      return res.status(403).json({ success: false, message: 'Only customers can view order history' });
    }

    const orders = await Order.find({
      customerId: req.user._id,
      $or: [
        { paymentStatus: { $exists: false } },
        { paymentStatus: { $ne: 'pending' } },
      ],
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders.map(serializeOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single order for the current customer
// @route   GET /api/orders/:id
// @access  Private (customer)
exports.getOrderById = async (req, res) => {
  try {
    if (!isCustomer(req)) {
      return res.status(403).json({ success: false, message: 'Only customers can view orders' });
    }

    const order = await Order.findOne({
      orderNumber: req.params.id,
      customerId: req.user._id,
      $or: [
        { paymentStatus: { $exists: false } },
        { paymentStatus: { $ne: 'pending' } },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a customer order from the cart
// @route   POST /api/orders
// @access  Private (customer)
exports.createOrder = async (req, res) => {
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
      if (contactPhone?.trim()) {
        customer.phone = contactPhone.trim();
      }
      await customer.save();
    }

    res.status(201).json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
