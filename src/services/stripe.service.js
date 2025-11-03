const config = require('../config/env');
const stripe = require('../config/stripe');

/**
 * Map Stripe decline codes to user-friendly error messages
 * Reference: https://stripe.com/docs/declines/codes
 */
const getDeclineMessage = (declineCode, defaultMessage) => {
  const declineMessages = {
    // Generic declines
    'generic_decline': 'Your card was declined. Please try a different card or contact your bank.',
    'insufficient_funds': 'Your card has insufficient funds. Please use a different payment method.',
    'lost_card': 'Your card was declined. The card may have been reported as lost. Please contact your bank.',
    'stolen_card': 'Your card was declined. The card may have been reported as stolen. Please contact your bank.',
    
    // Card errors
    'card_not_supported': 'This card type is not supported. Please use a different card.',
    'currency_not_supported': 'This currency is not supported by your card. Please use a different card.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'Your card\'s security code is incorrect. Please check and try again.',
    'incorrect_number': 'Your card number is incorrect. Please check and try again.',
    'invalid_cvc': 'Your card\'s security code is invalid. Please check and try again.',
    'invalid_expiry_month': 'Your card\'s expiration month is invalid. Please check and try again.',
    'invalid_expiry_year': 'Your card\'s expiration year is invalid. Please check and try again.',
    'invalid_number': 'Your card number is invalid. Please check and try again.',
    
    // Processing errors
    'processing_error': 'An error occurred while processing your card. Please try again.',
    'reenter_transaction': 'Your card was declined. Please try again or use a different payment method.',
    
    // Restriction errors
    'restricted_card': 'Your card was declined. The card has restrictions that prevent this transaction.',
    'security_violation': 'Your card was declined due to a security violation. Please contact your bank.',
    'service_not_allowed': 'The card issuer declined the transaction. Please contact your bank.',
    'stop_payment_order': 'Your card was declined. A stop payment order is in effect. Please contact your bank.',
    
    // Authentication errors
    'authentication_required': 'Your card requires additional authentication. Please complete the verification.',
    'try_again_later': 'Your card was declined. Please try again in a few minutes.',
    'withdrawal_count_limit_exceeded': 'Your card has exceeded withdrawal limits. Please use a different payment method.',
  };

  return declineMessages[declineCode] || defaultMessage || 'Your payment was declined. Please try again or use a different payment method.';
};

/**
 * Extract user-friendly error message from Stripe error
 */
const getErrorMessage = (error) => {
  // Check for Stripe API error
  if (error.type && error.type.startsWith('Stripe')) {
    // Check for decline code
    if (error.decline_code) {
      return getDeclineMessage(error.decline_code, error.message);
    }
    
    // Check for code (decline code might be in code field)
    if (error.code && error.code.includes('decline')) {
      return getDeclineMessage(error.code, error.message);
    }
    
    // Check for specific error types
    if (error.code === 'card_declined') {
      return getDeclineMessage(error.decline_code, error.message);
    }
    
    if (error.code === 'insufficient_funds') {
      return getDeclineMessage('insufficient_funds', error.message);
    }
    
    if (error.code === 'expired_card') {
      return getDeclineMessage('expired_card', error.message);
    }
    
    if (error.code === 'incorrect_cvc') {
      return getDeclineMessage('incorrect_cvc', error.message);
    }
    
    if (error.code === 'processing_error') {
      return getDeclineMessage('processing_error', error.message);
    }
    
    // Authentication required (3D Secure)
    if (error.code === 'authentication_required') {
      return 'Your card requires additional authentication. Please complete the verification to proceed.';
    }
    
    // Generic Stripe error
    return error.message || 'Payment processing failed. Please try again.';
  }
  
  // Return the error message as-is
  return error.message || 'An unexpected error occurred. Please try again.';
};

class StripeService {
  /**
   * Create a payment intent for frontend integration
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (default: 'gbp')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent
   */
  static async createPaymentIntent(amount, currency = config.currency.default, metadata = {}) {
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
   * @param {string} currency - Currency code (default: 'gbp')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with PayPal enabled
   */
  static async createPayPalPaymentIntent(amount, currency = config.currency.default, metadata = {}) {
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
   * @param {string} currency - Currency code (default: 'gbp')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with Apple Pay enabled
   */
  static async createApplePayPaymentIntent(amount, currency = config.currency.default, metadata = {}) {
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
   * @param {string} currency - Currency code (default: 'gbp')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with Google Pay enabled
   */
  static async createGooglePayPaymentIntent(amount, currency = config.currency.default, metadata = {}) {
    try {
      // For Google Pay, we need card payment methods enabled
      // Google Pay works through the Payment Request API which requires card support
      // Note: Cannot use both payment_method_types and automatic_payment_methods
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        // Google Pay requires card payment methods
        // Use payment_method_types for card support (Google Pay uses card-based payments)
        payment_method_types: ['card'],
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createGooglePayPaymentIntent error:', error);
      throw new Error(`Failed to create Google Pay payment intent: ${error.message}`);
    }
  }

  /**
   * Create a payment intent specifically for Klarna payments
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: 'gbp')
   * @param {object} metadata - Additional metadata
   * @param {object} customerInfo - Customer information (email, name, shipping address)
   * @returns {Promise<object>} Stripe payment intent with Klarna enabled
   */
  static async createKlarnaPaymentIntent(amount, currency = config.currency.default, metadata = {}, customerInfo = null) {
    try {
      const paymentIntentData = {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        // Use automatic_payment_methods with allow_redirects for Klarna redirect flow
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        },
      };

      // Note: Customer information and shipping address will be collected during redirect flow
      // Stripe will handle collecting this information when user redirects to Klarna

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createKlarnaPaymentIntent error:', error);
      throw new Error(`Failed to create Klarna payment intent: ${error.message}`);
    }
  }

  /**
   * Create a payment intent specifically for Link payments
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: 'gbp')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe payment intent with Link enabled
   */
  static async createLinkPaymentIntent(amount, currency = config.currency.default, metadata = {}) {
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
      console.error('Stripe createLinkPaymentIntent error:', error);
      throw new Error(`Failed to create Link payment intent: ${error.message}`);
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
   * Note: This method is deprecated in favor of Payment Intents
   * @param {string} paymentMethodId - Stripe payment method ID
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Stripe charge
   */
  static async createCharge(paymentMethodId, amount, currency = config.currency.default, metadata = {}) {
    try {
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        source: paymentMethodId,
        metadata,
      });

      // ✅ FRAUD PREVENTION: Verify charge status
      if (charge.status !== 'succeeded') {
        throw new Error(`Charge status is invalid: ${charge.status}. Expected: succeeded`);
      }

      return charge;
    } catch (error) {
      console.error('Stripe createCharge error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to create charge: ${errorMessage}`);
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
  static async processPayment(paymentData, amount, currency = config.currency.default, metadata = {}) {
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
        // ❌ SECURITY ISSUE: Credit card payments must be confirmed by frontend first
        // The frontend should:
        // 1. Create payment intent (or get from backend)
        // 2. Confirm it using stripe.confirmCardPayment() with card details
        // 3. Only send paymentIntentId to backend after confirmation
        // 
        // Backend should NOT create payment intent for credit cards - frontend must handle confirmation
        // This prevents creating orders for unconfirmed payments
        
        throw new Error('Credit card payments must be confirmed on frontend before processing. Payment intent must be confirmed and paymentIntentId must be provided.');
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
      } else if (paymentData.method === 'klarna') {
        // For Klarna payments, create a payment intent with Klarna enabled
        console.log('💚 Creating payment intent for Klarna payment...');
        const paymentIntent = await this.createKlarnaPaymentIntent(amount, currency, metadata);
        return {
          success: true,
          paymentIntent,
          chargeId: null, // Will be available after confirmation
        };
      } else if (paymentData.method === 'link') {
        // For Link payments, create a payment intent with Link enabled
        console.log('🔗 Creating payment intent for Link payment...');
        const paymentIntent = await this.createLinkPaymentIntent(amount, currency, metadata);
        return {
          success: true,
          paymentIntent,
          chargeId: null, // Will be available after confirmation
        };
      }

      // If paymentIntentId is provided, retrieve and verify the confirmed payment intent
      if (paymentIntentId) {
        console.log('✅ Retrieving confirmed payment intent:', paymentIntentId);
        
        // Payment intent is already confirmed by frontend, just retrieve it with charges expanded
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['charges', 'payment_method']
        });
        
        // ✅ FRAUD PREVENTION: Verify payment intent status
        console.log(`🔍 Verifying payment intent status: ${paymentIntent.status}`);
        
        // Check if payment requires action (3D Secure/SCA)
        if (paymentIntent.status === 'requires_action') {
          const errorMessage = 'Payment requires additional authentication. Please complete the verification process.';
          console.error('❌ Payment requires action (3D Secure/SCA):', paymentIntent.next_action);
          return {
            success: false,
            error: errorMessage,
            requiresAction: true,
            paymentIntent
          };
        }
        
        // Check if payment was canceled
        if (paymentIntent.status === 'canceled') {
          const errorMessage = 'Payment was canceled. Please try again with a new payment method.';
          console.error('❌ Payment was canceled');
          return {
            success: false,
            error: errorMessage,
            canceled: true
          };
        }
        
        // Check if payment is still processing
        if (paymentIntent.status === 'processing') {
          const errorMessage = 'Payment is still processing. Please wait a moment and try again.';
          console.warn('⚠️ Payment is still processing');
          return {
            success: false,
            error: errorMessage,
            processing: true,
            paymentIntent
          };
        }
        
        // Check if payment requires payment method
        if (paymentIntent.status === 'requires_payment_method') {
          const errorMessage = 'Payment method is required. Please provide a valid payment method.';
          console.error('❌ Payment requires payment method');
          return {
            success: false,
            error: errorMessage,
            requiresPaymentMethod: true
          };
        }
        
        // Check if payment requires capture
        if (paymentIntent.status === 'requires_capture') {
          const errorMessage = 'Payment requires capture. This should not happen in normal flow.';
          console.error('❌ Payment requires capture');
          return {
            success: false,
            error: errorMessage,
            requiresCapture: true,
            paymentIntent
          };
        }
        
        // ✅ FRAUD PREVENTION: Verify payment actually succeeded
        if (paymentIntent.status !== 'succeeded') {
          const errorMessage = `Payment status is invalid: ${paymentIntent.status}. Expected: succeeded`;
          console.error(`❌ Payment status mismatch: ${paymentIntent.status}`);
          return {
            success: false,
            error: errorMessage,
            invalidStatus: true,
            status: paymentIntent.status
          };
        }
        
        // ✅ FRAUD PREVENTION: Verify charge status
        let chargeId = null;
        let charge = null;
        
        if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
          charge = paymentIntent.charges.data[0];
          chargeId = charge.id;
          
          // Verify charge status
          if (charge.status !== 'succeeded') {
            const errorMessage = `Charge status is invalid: ${charge.status}. Expected: succeeded`;
            console.error(`❌ Charge status mismatch: ${charge.status}`);
            return {
              success: false,
              error: errorMessage,
              invalidChargeStatus: true,
              chargeStatus: charge.status
            };
          }
          
          // ✅ FRAUD PREVENTION: Check for fraud indicators
          if (charge.outcome) {
            console.log('🔍 Charge outcome:', {
              type: charge.outcome.type,
              network_status: charge.outcome.network_status,
              risk_level: charge.outcome.risk_level,
              risk_score: charge.outcome.risk_score
            });
            
            // Check if charge was reviewed as fraudulent
            if (charge.outcome.type === 'manual_review' || charge.outcome.risk_level === 'highest') {
              console.warn('⚠️ High-risk transaction detected');
              // Log but don't block - let Stripe Radar handle it
              // You can add additional logic here to flag for manual review
            }
            
            // Check network status
            if (charge.outcome.network_status === 'declined_by_network') {
              const errorMessage = 'Your card was declined by the card network. Please try a different card.';
              return {
                success: false,
                error: errorMessage,
                declinedByNetwork: true
              };
            }
          }
        } else if (paymentIntent.latest_charge) {
          chargeId = paymentIntent.latest_charge;
          
          // If latest_charge is a string ID, retrieve it
          if (typeof chargeId === 'string' && !chargeId.startsWith('ch_')) {
            // It might be a charge ID, retrieve it
            try {
              charge = await stripe.charges.retrieve(chargeId);
              
              if (charge.status !== 'succeeded') {
                const errorMessage = `Charge status is invalid: ${charge.status}. Expected: succeeded`;
                console.error(`❌ Charge status mismatch: ${charge.status}`);
                return {
                  success: false,
                  error: errorMessage,
                  invalidChargeStatus: true,
                  chargeStatus: charge.status
                };
              }
            } catch (chargeError) {
              console.error('❌ Error retrieving charge:', chargeError);
              // Continue with chargeId as string
            }
          }
        }
        
        // ✅ FRAUD PREVENTION: Verify payment amount matches
        const expectedAmount = Math.round(amount * 100); // Convert to cents
        if (paymentIntent.amount !== expectedAmount) {
          const errorMessage = `Payment amount mismatch. Expected: ${expectedAmount} cents, Got: ${paymentIntent.amount} cents`;
          console.error(`❌ Amount mismatch: Expected ${expectedAmount}, Got ${paymentIntent.amount}`);
          return {
            success: false,
            error: errorMessage,
            amountMismatch: true,
            expectedAmount,
            actualAmount: paymentIntent.amount
          };
        }
        
        console.log('✅ Payment intent verified successfully:', {
          status: paymentIntent.status,
          chargeId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        
        return {
          success: true,
          paymentIntent,
          chargeId: chargeId || null, // Ensure it's null, not undefined
          charge
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
      
      // ✅ ENHANCED ERROR HANDLING: Map Stripe errors to user-friendly messages
      const errorMessage = getErrorMessage(error);
      
      // Log detailed error information for debugging
      console.error('Error details:', {
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        message: error.message,
        userMessage: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage,
        stripeError: {
          type: error.type,
          code: error.code,
          decline_code: error.decline_code,
          rawMessage: error.message
        }
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

  /**
   * Register a domain with Stripe for Google Pay/Apple Pay
   * Required for production domains (not needed for localhost)
   * @param {string} domainName - Domain name to register (e.g., 'example.com')
   * @returns {Promise<object>} Registered domain object
   */
  static async registerPaymentMethodDomain(domainName) {
    try {
      console.log(`🌐 Registering domain ${domainName} with Stripe for Google Pay/Apple Pay...`);
      
      // Register domain with Stripe
      const domain = await stripe.paymentMethodDomains.create({
        domain_name: domainName,
      });

      console.log(`✅ Domain ${domainName} registered successfully:`, domain.id);
      return domain;
    } catch (error) {
      console.error('Stripe registerPaymentMethodDomain error:', error);
      
      // If domain already exists, that's okay
      if (error.code === 'resource_already_exists') {
        console.log(`ℹ️ Domain ${domainName} is already registered`);
        // Try to retrieve existing domain
        const domains = await stripe.paymentMethodDomains.list();
        const existingDomain = domains.data.find(d => d.domain_name === domainName);
        if (existingDomain) {
          return existingDomain;
        }
      }
      
      throw new Error(`Failed to register domain: ${error.message}`);
    }
  }

  /**
   * List all registered payment method domains
   * @returns {Promise<object>} List of registered domains
   */
  static async listPaymentMethodDomains() {
    try {
      const domains = await stripe.paymentMethodDomains.list({ limit: 100 });
      return domains;
    } catch (error) {
      console.error('Stripe listPaymentMethodDomains error:', error);
      throw new Error(`Failed to list domains: ${error.message}`);
    }
  }
}

module.exports = StripeService;
