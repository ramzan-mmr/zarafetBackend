const router = require('express').Router();
const { validateBody, validateParams } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { idParam } = require('../validators/common');
const { createPaymentIntent, processPayment, getPayment, createPaymentIntentGuest, processPaymentGuest } = require('../validators/payments');
const ctrl = require('../controllers/payments.controller');
const config = require('../config/env');

// Get Stripe config (public endpoint - no auth required - MUST be before router.use(verifyJWT))
router.get('/config', (req, res) => {
  try {
    res.json({
      publishableKey: config.stripe.publishableKey || null
    });
  } catch (error) {
    console.error('Get Stripe config error:', error);
    res.status(500).json({ error: 'Failed to get Stripe configuration' });
  }
});

// Guest checkout endpoints (public - no auth required)
router.post('/check-guest-email', ctrl.checkGuestEmail);
router.post('/create-intent-guest',
  validateBody(createPaymentIntentGuest),
  ctrl.createIntentGuest
);
router.post('/process-guest',
  validateBody(processPaymentGuest),
  ctrl.processGuest
);

// PayPal config and create-order (public for guest checkout)
router.get('/paypal/config',
  ctrl.getConfig);
router.post('/paypal/create-order',
  ctrl.createPaypalOrder);

// All routes below require authentication
router.use(verifyJWT);


// Create payment intent for frontend
router.post('/create-intent',
  validateBody(createPaymentIntent),
  ctrl.createIntent
);
// Process payment and create order (main endpoint)
router.post('/process',
  validateBody(processPayment),
  ctrl.process
);
// Get payment details
router.get('/:id',
  validateParams(idParam),
  ctrl.getById
);
// Register domain with Stripe for Google Pay/Apple Pay (one-time setup)
router.post('/register-domain',
  ctrl.registerDomain
);
// List all registered payment method domains
router.get('/domains/list',
  ctrl.listDomains
);

module.exports = router;
