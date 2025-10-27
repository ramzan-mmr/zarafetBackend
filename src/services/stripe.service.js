const stripe = require('../config/stripe');

class StripeService {
  /**
   * Create a payment intent for frontend integration
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (default: 'usd')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent
   */
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Create a payment intent specifically for PayPal payments
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: 'usd')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with PayPal enabled
   */
  static async createPayPalPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        payment_method_types: ['paypal'],
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createPayPalPaymentIntent error:', error);
      throw new Error(`Failed to create PayPal payment intent: ${error.message}`);
    }
  }

  /**
   * Create a payment intent specifically for Apple Pay payments
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: 'usd')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with Apple Pay enabled
   */
  static async createApplePayPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createApplePayPaymentIntent error:', error);
      throw new Error(`Failed to create Apple Pay payment intent: ${error.message}`);
    }
  }

  /**
   * Create a payment intent specifically for Google Pay payments
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: 'usd')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with Google Pay enabled
   */
  static async createGooglePayPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createGooglePayPaymentIntent error:', error);
      throw new Error(`Failed to create Google Pay payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<object>} Confirmed payment intent
   */
  static async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return paymentIntent;
      }
      
      throw new Error(`Payment not succeeded. Status: ${paymentIntent.status}`);
    } catch (error) {
      console.error('Stripe confirmPayment error:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Create a direct charge (for simple payment flows)
   * @param {string} paymentMethodId - Stripe payment method ID
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe charge
   */
  static async createCharge(paymentMethodId, amount, currency = 'usd', metadata = {}) {
    try {
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        source: paymentMethodId,
        metadata,
      });

      return charge;
    } catch (error) {
      console.error('Stripe createCharge error:', error);
      throw new Error(`Failed to create charge: ${error.message}`);
    }
  }

  /**
   * Process payment with payment method from frontend
   * @param {object} paymentData - Payment data from frontend
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Payment result
   */
  static async processPayment(paymentData, amount, currency = 'usd', metadata = {}) {
    try {
      console.log('🔍 StripeService.processPayment called with:', {
        paymentData,
        amount,
        currency,
        metadata
      });

      // Handle different payment data structures
      let paymentMethod = null;
      let paymentIntentId = null;

      // Check if paymentData has the structure from frontend
      if (paymentData.paymentIntentId && paymentData.paymentIntentId !== '') {
        paymentIntentId = paymentData.paymentIntentId;
      } else if (paymentData.method === 'creditCard') {
        // For credit card payments, we need to create a payment intent
        console.log('💳 Creating payment intent for credit card payment...');
        const paymentIntent = await this.createPaymentIntent(amount, currency, metadata);
        return {
          success: true,
          paymentIntent,
          chargeId: null, // Will be available after confirmation
        };
      } else if (paymentData.method === 'paypal') {
        // For PayPal payments, create a payment intent with PayPal enabled
        console.log('💰 Creating payment intent for PayPal payment...');
        const paymentIntent = await this.createPayPalPaymentIntent(amount, currency, metadata);
        return {
          success: true,
          paymentIntent,
          chargeId: null, // Will be available after confirmation
        };
      } else if (paymentData.method === 'applePay') {
        // For Apple Pay payments, create a payment intent with Apple Pay enabled
        console.log('🍎 Creating payment intent for Apple Pay payment...');
        const paymentIntent = await this.createApplePayPaymentIntent(amount, currency, metadata);
        return {
          success: true,
          paymentIntent,
          chargeId: null, // Will be available after confirmation
        };
      } else if (paymentData.method === 'googlePay') {
        // For Google Pay payments, create a payment intent with Google Pay enabled
        console.log('🔵 Creating payment intent for Google Pay payment...');
        const paymentIntent = await this.createGooglePayPaymentIntent(amount, currency, metadata);
        return {
          success: true,
          paymentIntent,
          chargeId: null, // Will be available after confirmation
        };
      }

      // If paymentIntentId is provided, confirm the existing intent
      if (paymentIntentId) {
        console.log('✅ Confirming existing payment intent:', paymentIntentId);
        const paymentIntent = await this.confirmPayment(paymentIntentId);
        return {
          success: true,
          paymentIntent,
          chargeId: paymentIntent.charges?.data?.[0]?.id,
        };
      }

      // If paymentMethod is provided, create a direct charge
      if (paymentMethod) {
        console.log('💳 Creating direct charge with payment method:', paymentMethod);
        const charge = await this.createCharge(paymentMethod, amount, currency, metadata);
        return {
          success: true,
          charge,
          chargeId: charge.id,
        };
      }

      throw new Error('Either paymentMethod or paymentIntentId must be provided');
    } catch (error) {
      console.error('Stripe processPayment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund a payment
   * @param {string} chargeId - Stripe charge ID
   * @param {number} amount - Amount to refund in dollars (optional, full refund if not provided)
   * @returns {Promise<object>} Refund result
   */
  static async refundPayment(chargeId, amount = null) {
    try {
      const refundData = {
        charge: chargeId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Stripe refundPayment error:', error);
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }

  /**
   * Get payment intent details
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<object>} Payment intent details
   */
  static async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe getPaymentIntent error:', error);
      throw new Error(`Failed to get payment intent: ${error.message}`);
    }
  }
}

module.exports = StripeService;
