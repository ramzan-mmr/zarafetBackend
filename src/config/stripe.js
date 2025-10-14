const stripe = require('stripe');
const config = require('./env');

// Debug: Log environment variables
console.log('🔍 Debugging Stripe configuration:');
console.log('STRIPE_SECRET_KEY from env:', process.env.STRIPE_SECRET_KEY);
console.log('config.stripe.secretKey:', config.stripe.secretKey);
console.log('config.stripe.publishableKey:', config.stripe.publishableKey);

// Initialize Stripe with secret key from environment
let stripeInstance = null;

if (config.stripe.secretKey) {
  stripeInstance = stripe(config.stripe.secretKey);
  console.log('✅ Stripe initialized successfully');
} else {
  console.warn('❌ Stripe secret key not found. Stripe functionality will be disabled.');
  console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
}

module.exports = stripeInstance;
