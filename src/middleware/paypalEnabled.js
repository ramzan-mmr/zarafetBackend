const config = require('../config/env');
const responses = require('../utils/responses');

const requirePaypalEnabled = (req, res, next) => {
  if (!config.paypal.enabled) {
    return res.status(503).json(responses.error(
      'PAYPAL_DISABLED',
      'PayPal is temporarily unavailable. Please choose another payment method.'
    ));
  }
  next();
};

const checkPaypalPayment = (req, res, next) => {
  if (req.body?.payment?.method === 'paypal') return requirePaypalEnabled(req, res, next);
  next();
};

module.exports = { requirePaypalEnabled, checkPaypalPayment };
