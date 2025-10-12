const stripe = require('stripe');
const config = require('./env');

// Initialize Stripe with secret key from environment
let stripeInstance = null;

if (config.stripe.secretKey) {
  stripeInstance = stripe(config.stripe.secretKey);
  console.log('Stripe initialized successfully');
} else {
  console.warn('Stripe secret key not found. Stripe functionality will be disabled.');
}

module.exports = stripeInstance;
