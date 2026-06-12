const Stripe = require('stripe');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// @desc    Handle Stripe webhooks
// @route   POST /api/webhooks/stripe
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Construct the event using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the order
    const orderId = session.metadata?.orderId;
    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'Confirmed';
          order.stripeSessionId = session.id;
          order.stripePaymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null;
          order.paidAt = new Date();
          await order.save();

          // Update customer loyalty points
          if (order.customerId) {
            const customer = await Customer.findById(order.customerId);
            if (customer) {
              const pointsEarned = Math.floor(order.total / 100);
              customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
              customer.totalPurchases = (customer.totalPurchases || 0) + order.total;
              customer.lastPurchase = new Date();
              if (order.contactPhone?.trim()) {
                customer.phone = order.contactPhone.trim();
              }
              await customer.save();
            }
          }
          console.log(`[Stripe Webhook] Order ${orderId} marked as paid.`);
        }
      } catch (err) {
        console.error('[Stripe Webhook] Error updating order:', err);
      }
    }
  }

  // Return a 200 res to acknowledge receipt of the event
  res.send();
};
