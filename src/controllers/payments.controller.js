const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');
const OrderAddress = require('../models/OrderAddress.model');
const User = require('../models/User.model');
const StripeService = require('../services/stripe.service');
const EmailService = require('../services/email.service');
const responses = require('../utils/responses');
const config = require('../config/env');

const createIntent = async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
    const paymentIntent = await StripeService.createPaymentIntent(
      amount,
      currency,
      {
        ...metadata,
        user_id: req.user.id
      }
    );

    res.json(responses.ok({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }));
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json(responses.internalError('Failed to create payment intent'));
  }
};

const process = async (req, res) => {
  try {
  //  return console.log('🚀 Starting payment process...', req.body.promoCode);
    const { cart, address, shipping, payment, totals, promoCode } = req.body;
    const user_id = req.user?.id || 5; // Use dummy user ID for testing
    
    // Debug: Log the incoming request data
    console.log('🔍 DEBUGGING PAYMENT REQUEST:');
    console.log('   Promo Code received:', promoCode);
    console.log('   Cart subtotal:', cart.subtotal);
    console.log('   Shipping cost:', shipping.cost);
    console.log('   Full request body keys:', Object.keys(req.body));
    console.log('🚨 PAYMENTS CONTROLLER - PROMO CODE PROCESSING ACTIVE!');
    
    console.log('📦 Request data:', {
      user_id,
      cart_items_count: cart?.items?.length,
      address_id: address?.id,
      shipping_cost: shipping?.cost,
      payment_method: payment?.method
    });

    // Validate cart items and calculate expected total
    console.log('🛒 Processing cart items...');
    let expectedSubtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      console.log(`📋 Processing item: ${item.name} (ID: ${item.productId})`);
      
      const product = await Order.getProductWithVariant(item.productId, item.variant.id);
      if (!product) {
        console.error(`❌ Product not found: ${item.productId}`);
        return res.status(400).json(responses.error('PRODUCT_NOT_FOUND', `Product not found: ${item.productId}`));
      }

      console.log(`✅ Product found: ${product.name}`);

      // Check stock
      const availableStock = item.variant.id ? product.variant_stock : product.stock;
      console.log(`📊 Stock check: Required=${item.quantity}, Available=${availableStock}`);
      
      if (availableStock < item.quantity) {
        console.error(`❌ Insufficient stock for ${product.name}`);
        return res.status(400).json(responses.error('INSUFFICIENT_STOCK', `Insufficient stock for product: ${product.name}`));
      }

      const unitPrice = parseFloat(item.price) + parseFloat(item.variant.extra_price || 0);
      const itemTotal = unitPrice * item.quantity;
      expectedSubtotal += itemTotal;

      console.log(`💰 Item pricing: Unit=${unitPrice}, Quantity=${item.quantity}, Total=${itemTotal}`);

      orderItems.push({
        product_id: item.productId,
        variant_id: item.variant.id,
        quantity: item.quantity,
        unit_price: unitPrice
      });
    }

    console.log(`📊 Cart calculation: Subtotal=${expectedSubtotal}, Items=${orderItems.length}`);

    // Backend calculates shipping using environment variables
    console.log('🧮 Calculating totals...');
    const expectedTax = 0; // No tax
    
    console.log(`💰 Tax calculation: Tax=${expectedTax}`);
    
    // Calculate shipping cost (can be enhanced with free shipping logic)
    let expectedShipping = shipping.cost; // Use frontend shipping cost
    if (expectedSubtotal >= config.pricing.freeShippingThreshold) {
      expectedShipping = 0; // Free shipping for orders above threshold
      console.log(`🚚 Free shipping applied! Order exceeds ${config.pricing.freeShippingThreshold}`);
    }
    
    // Calculate promo code discount
    let discountAmount = 0;
    if (promoCode && promoCode.discountAmount) {
      discountAmount = parseFloat(promoCode.discountAmount);
      console.log(`🎟️ Promo code applied: ${promoCode.code}, Discount: £${discountAmount}`);
      console.log(`📊 Order totals before discount: Subtotal=£${expectedSubtotal}, Shipping=£${expectedShipping}, Total=£${expectedSubtotal + expectedTax + expectedShipping}`);
    }
    
    const expectedTotal = expectedSubtotal + expectedTax + expectedShipping - discountAmount;
    
    if (promoCode && promoCode.discountAmount) {
      console.log(`💰 Final order total after discount: £${expectedTotal}`);
      console.log(`📋 Order data being passed to Order.create():`, {
        subtotal: expectedSubtotal,
        tax: expectedTax,
        shipping: expectedShipping,
        total: expectedTotal,
        promoCode: promoCode
      });
    }
    
    console.log(`📊 Final totals: Subtotal=${expectedSubtotal}, Tax=${expectedTax}, Shipping=${expectedShipping}, Total=${expectedTotal}`);

    // Remove total validation - backend calculates everything
    // if (Math.abs(expectedTotal - totals.total) > 0.01) {
    //   return res.status(400).json(responses.error('TOTAL_MISMATCH', 'Calculated total does not match provided total'));
    // }

    // Process payment with backend-calculated total
    console.log(`💳 Processing ${payment.method} payment with Stripe...`);
    const paymentResult = await StripeService.processPayment(
      payment,
      expectedTotal, // Use backend-calculated total
      'usd',
      {
        user_id,
        order_items: orderItems.length,
        subtotal: expectedSubtotal,
        shipping: expectedShipping,
        tax: expectedTax,
        payment_method: payment.method
      }
    );

    console.log('💳 Stripe payment result:', {
      success: paymentResult.success,
      error: paymentResult.error
    });

    if (!paymentResult.success) {
      console.error('❌ Payment failed:', paymentResult.error);
      return res.status(400).json(responses.error('PAYMENT_FAILED', paymentResult.error));
    }

    console.log('✅ Payment successful!');

    // Create payment record with backend-calculated amount
    console.log('💾 Creating payment record...');
    const paymentData = {
      order_id: null, // Will be set after order creation
      stripe_payment_intent_id: paymentResult.paymentIntent?.id || paymentResult.charge?.payment_intent,
      stripe_charge_id: paymentResult.chargeId,
      amount: expectedTotal, // Use backend-calculated total
      currency: 'usd',
      status: 'succeeded',
      payment_method: payment.method,
      payment_method_details: payment.method === 'paypal' ? { method: 'paypal' } : payment.cardDetails,
      metadata: {
        user_id,
        order_items: orderItems.length,
        subtotal: expectedSubtotal,
        tax: expectedTax,
        shipping: expectedShipping,
        payment_method: payment.method
      }
    };

    console.log('💾 Payment data:', paymentData);
    const paymentRecord = await Payment.create(paymentData);
    console.log('✅ Payment record created:', paymentRecord.id);

    // Prepare order data with backend-calculated totals
    console.log('📦 Preparing order data...');
    const orderData = {
      user_id,
      items: orderItems,
      address_id: address.id,
      shipment: {
        method_value_id: shipping.method.id,
        scheduled_date: null,
        cost: shipping.cost
      },
      payment_method_value_id: null, // Will be set based on payment method
      discount_type_value_id: null,
      notes: null,
      payment_id: paymentRecord.id,
      address_snapshot: {
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        postal_code: address.postalCode,
        phone: address.phone
      },
      // Backend-calculated totals
      subtotal: expectedSubtotal,
      tax: expectedTax,
      shipping: expectedShipping,
      total: expectedTotal,
      // Promo code data
      promoCode: promoCode ? {
        code: promoCode.code,
        discountAmount: discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        promoCodeId: null // Placeholder, will be set if we find the promo code in database
      } : null
    };

    console.log('📦 Order data:', {
      user_id: orderData.user_id,
      items_count: orderData.items.length,
      address_id: orderData.address_id,
      payment_id: orderData.payment_id,
      totals: {
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total
      }
    });

    // Create order
    console.log('🛒 Creating order...');
    const order = await Order.create(orderData);
    console.log('✅ Order created successfully:', order.id);
    
    // Send order confirmation email
    try {
      const user = await User.findById(user_id);
      if (user && user.email) {
        console.log('📧 Sending order confirmation email...');
        
        // Get order details with items for email
        const orderWithItems = await Order.findById(order.id);
        
        const emailData = {
          userEmail: user.email,
          userName: user.name,
          orderData: {
            order: orderWithItems,
            items: orderWithItems.items || [],
            totals: {
              subtotal: expectedSubtotal,
              tax: expectedTax,
              shipping: expectedShipping,
              total: expectedTotal
            },
            address: {
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              postal_code: address.postalCode,
              phone: address.phone
            },
            // Include promo code information if applied
            promoCode: promoCode ? {
              code: promoCode.code,
              discountAmount: discountAmount,
              discountType: promoCode.discountType,
              discountValue: promoCode.discountValue
            } : null
          }
        };
        
        const emailResult = await EmailService.sendOrderConfirmation(emailData);
        if (emailResult.success) {
          console.log('✅ Order confirmation email sent successfully');
        } else {
          console.error('❌ Failed to send order confirmation email:', emailResult.error);
        }
      } else {
        console.warn('⚠️ User email not found, skipping order confirmation email');
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }
    
    console.log('🎉 Payment process completed successfully!');
    console.log('📤 Sending response to frontend...');
    
    res.status(201).json(responses.created({
      order,
      payment: {
        id: paymentRecord.id,
        status: paymentRecord.status,
        amount: paymentRecord.amount,
        stripe_payment_intent_id: paymentRecord.stripe_payment_intent_id
      },
      // Return backend-calculated totals to frontend
      totals: {
        subtotal: expectedSubtotal,
        tax: expectedTax,
        shipping: expectedShipping,
        total: expectedTotal
      },
      // Include promo code information if applied
      promoCode: promoCode ? {
        code: promoCode.code,
        discountAmount: discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue
      } : null
    }));
  } catch (error) {
    console.error('❌ Process payment error:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
      console.error('❌ Order validation error:', error.message);
      res.status(400).json(responses.error('ORDER_ERROR', error.message));
    } else {
      console.error('❌ Internal server error:', error.message);
      res.status(500).json(responses.internalError('Failed to process payment'));
    }
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json(responses.notFound('Payment'));
    }

    // Check if user has access to this payment
    if (payment.metadata && payment.metadata.user_id !== req.user.id) {
      return res.status(403).json(responses.error('ACCESS_DENIED', 'You do not have access to this payment'));
    }
    
    res.json(responses.ok(payment));
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json(responses.internalError('Failed to fetch payment'));
  }
};

module.exports = {
  createIntent,
  process,
  getById
};
