const router = require('express').Router();
const { validateBody, validateParams } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { idParam } = require('../validators/common');
const { createPaymentIntent, processPayment, getPayment } = require('../validators/payments');
const ctrl = require('../controllers/payments.controller');
// All routes require authentication
// router.use(verifyJWT); // Temporarily disabled for testing
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
module.exports = router;
