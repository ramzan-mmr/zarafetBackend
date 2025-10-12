const stripe = require('stripe');
const config = require('./env');

// Initialize Stripe with secret key from environment
const stripeInstance = stripe(config.stripe.secretKey);

console.log('Stripe initialized successfully');

module.exports = stripeInstance;