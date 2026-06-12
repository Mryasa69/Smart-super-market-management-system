const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controllers/webhookController');

// Stripe needs the raw body to construct the event, so we use express.raw()
// The raw body is needed to compute the signature
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
