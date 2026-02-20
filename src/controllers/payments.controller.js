const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');
const OrderAddress = require('../models/OrderAddress.model');
const User = require('../models/User.model');
const StripeService = require('../services/stripe.service');
const EmailService = require('../services/email.service');
const responses = require('../utils/responses');
const config = require('../config/env');
const { client, checkoutNodeJssdk, capturePaypalOrder } = require('../services/paypal.service');

const createIntent = async (req, res) => {
  try {
    console.log('[PAYMENTS] createIntent — from frontend:', JSON.stringify({
      bodyKeys: Object.keys(req.body || {}),
      amount: req.body?.amount,
      currency: req.body?.currency,
      metadata: req.body?.metadata,
      hasUser: !!req.user,
      userId: req.user?.id
    }, null, 2));

    const { amount, currency, metadata, customerInfo } = req.body;
    const paymentMethod = metadata?.payment_method;
    
    let paymentIntent;
    
    // Create payment intent based on payment method
    if (paymentMethod === 'klarna') {
      // Get user info for Klarna (requires customer details)
      const user = await User.findById(req.user.id);
      paymentIntent = await StripeService.createKlarnaPaymentIntent(
        amount,
        currency,
        {
          ...metadata,
          user_id: req.user.id
        },
        user ? {
          email: user.email,
          name: user.name
        } : null
      );
    } else if (paymentMethod === 'link') {
      paymentIntent = await StripeService.createLinkPaymentIntent(
        amount,
        currency,
        {
          ...metadata,
          user_id: req.user.id
        }
      );
    } else if (paymentMethod === 'googlePay') {
      paymentIntent = await StripeService.createGooglePayPaymentIntent(
        amount,
        currency,
        {
          ...metadata,
          user_id: req.user.id
        }
      );
    } else {
      // Default payment intent for credit card
      paymentIntent = await StripeService.createPaymentIntent(
        amount,
        currency,
        {
          ...metadata,
          user_id: req.user.id
        }
      );
    }

    res.json(responses.ok({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }));
  } catch (error) {
    console.error('[PAYMENTS] createIntent ERROR:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      response: error?.response?.data
    });
    res.status(500).json(responses.internalError('Failed to create payment intent'));
  }
};

const process = async (req, res) => {
  try {
    console.log('[PAYMENTS] process — from frontend:', JSON.stringify({
      bodyKeys: Object.keys(req.body || {}),
      hasUser: !!req.user,
      userId: req.user?.id,
      cart: req.body?.cart ? { itemsCount: req.body.cart.items?.length, subtotal: req.body.cart.subtotal } : null,
      address: req.body?.address ? { id: req.body.address.id, line1: req.body.address.line1, city: req.body.address.city } : null,
      shipping: req.body?.shipping ? { cost: req.body.shipping.cost, methodId: req.body.shipping.method?.id } : null,
      payment: req.body?.payment ? { method: req.body.payment.method, hasPaymentIntentId: !!req.body.payment.paymentIntentId } : null,
      totals: req.body?.totals,
      promoCode: req.body?.promoCode ? { code: req.body.promoCode.code, discountAmount: req.body.promoCode.discountAmount } : null
    }, null, 2));

    const { cart, address, shipping, payment, totals, promoCode } = req.body;
    if (!req.user || !req.user.id) {
      console.error('[PAYMENTS] process ERROR: Unauthorized — no req.user or req.user.id');
      return res.status(401).json(responses.error('UNAUTHORIZED', 'Authentication required'));
    }
    const user_id = req.user.id;
    
    console.log('[PAYMENTS] process — parsed:', { user_id, cart_items_count: cart?.items?.length, address_id: address?.id, shipping_cost: shipping?.cost, payment_method: payment?.method, promoCode: promoCode?.code });

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
    let paymentResult;
    if (payment?.method === "paypal") {
      const orderId = payment?.paymentIntentId;
      if (!orderId) {
        return res.status(400).json(responses.error('PAYPAL_ORDER_ID_REQUIRED', 'Missing PayPal order ID for capture'));
      }
      const captureResult = await capturePaypalOrder(orderId);
      if (!captureResult.success) {
        return res.status(400).json(responses.error('PAYMENT_FAILED', captureResult.message || 'Failed to capture PayPal payment'));
      } else {
        paymentResult = {
          success: true,
          paymentIntent: { id: captureResult.data?.id || orderId },
          chargeId: null,
          paymentDetails: captureResult.data
        };
        payment.paymentResp = {
          orderID: orderId,
          paymentID: captureResult.data?.id
        };
      }
    } else {
      paymentResult = await StripeService.processPayment(
        payment,
        expectedTotal, // Use backend-calculated total
        config.currency.default,
        {
          user_id,
          order_items: orderItems.length,
          subtotal: expectedSubtotal,
          shipping: expectedShipping,
          tax: expectedTax,
          payment_method: payment.method
        }
      );
    }

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
      stripe_payment_intent_id: paymentResult.paymentIntent?.id || paymentResult.charge?.payment_intent||paymentResult?.paymentIntent?.id,
      stripe_charge_id: paymentResult.chargeId || paymentResult?.paymentDetails?.id||null, // Ensure null instead of undefined
      amount: expectedTotal, // Use backend-calculated total
      currency: config.currency.default,
      status: 'succeeded',
      payment_method: payment.method,
      payment_method_details: payment.method === 'paypal' ? { method: 'paypal' } : (payment.method === 'googlePay' ? { method: 'googlePay' } : (payment.method === 'klarna' ? { method: 'klarna' } : (payment.method === 'link' ? { method: 'link' } : payment.cardDetails))),
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

    // Get customer name for order snapshot (so each order shows the name at placement)
    const user = await User.findById(user_id);

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
        recipient_name: user?.name || null,
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
    
    // Send order confirmation email in background (non-blocking)
    setImmediate(async () => {
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
        // Email failure doesn't affect the order
      }
    });
    
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
    console.error('[PAYMENTS] process ERROR:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      response: error?.response?.data,
      apiMessage: error?.apiMessage
    });
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
      res.status(400).json(responses.error('ORDER_ERROR', error.message));
    } else {
      res.status(500).json(responses.internalError('Failed to process payment'));
    }
  }
};

const getConfig = (req, res) => {
  try {
    const id=config.paypal.clientId
    if (!id) {
      return res.status(400).json(
        responses.error('failed', 'missing config')
      );
    }

    res.json(
      responses.ok({
        id: id
      })
    );
  } catch (error) {
    console.error('[PAYMENTS] getConfig ERROR:', { message: error?.message, stack: error?.stack });
    res.status(500).json(
      responses.internalError('Failed to fetch PayPal config')
    );
  }
};

const createPaypalOrder = async (req, res) => {
  try {
    const { amount ,currency} = req.body;

    if (!amount) {
      return res.status(400).json(
        responses.error('AMOUNT_REQUIRED', 'Amount is required')
      );
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          }
        }
      ]
    });

    const order = await client.execute(request);
    res.json(
      responses.ok({
        orderID: order.result.id
      })
    );
  } catch (error) {
    console.error('[PAYMENTS] createPaypalOrder ERROR:', { message: error?.message, stack: error?.stack, body: req.body });
    res.status(500).json(
      responses.internalError('Failed to create PayPal order')
    );
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
    console.error('[PAYMENTS] getById ERROR:', { id: req.params?.id, message: error?.message, stack: error?.stack });
    res.status(500).json(responses.internalError('Failed to fetch payment'));
  }
};

// Register domain with Stripe for Google Pay/Apple Pay (one-time setup)
const registerDomain = async (req, res) => {
  try {
    const { domain_name } = req.body;
    
    if (!domain_name) {
      return res.status(400).json(responses.error('DOMAIN_REQUIRED', 'Domain name is required'));
    }

    console.log(`🌐 Registering domain ${domain_name} with Stripe for Google Pay/Apple Pay...`);
    const domain = await StripeService.registerPaymentMethodDomain(domain_name);

    res.json(responses.ok({
      domain: domain,
      message: `Domain ${domain_name} registered successfully for Google Pay/Apple Pay`
    }));
  } catch (error) {
    console.error('Register domain error:', error);
    res.status(500).json(responses.internalError(error.message || 'Failed to register domain'));
  }
};

// List all registered payment method domains
const listDomains = async (req, res) => {
  try {
    const domains = await StripeService.listPaymentMethodDomains();
    res.json(responses.ok({
      domains: domains.data,
      count: domains.data.length
    }));
  } catch (error) {
    console.error('List domains error:', error);
    res.status(500).json(responses.internalError('Failed to list domains'));
  }
};

const createIntentGuest = async (req, res) => {
  try {
    console.log('[PAYMENTS] createIntentGuest — from frontend:', JSON.stringify({
      bodyKeys: Object.keys(req.body || {}),
      amount: req.body?.amount,
      currency: req.body?.currency,
      metadata: req.body?.metadata,
      guest: req.body?.guest ? { email: req.body.guest.email, name: req.body.guest.name } : null
    }, null, 2));

    const { amount, currency, metadata, guest } = req.body;
    const paymentMethod = metadata?.payment_method;

    let paymentIntent;
    const meta = { ...metadata, guest_checkout: true };
    if (guest?.email) meta.guest_email = guest.email;

    if (paymentMethod === 'klarna') {
      paymentIntent = await StripeService.createKlarnaPaymentIntent(
        amount, currency, meta,
        guest ? { email: guest.email, name: guest.name } : null
      );
    } else if (paymentMethod === 'link') {
      paymentIntent = await StripeService.createLinkPaymentIntent(amount, currency, meta);
    } else if (paymentMethod === 'googlePay') {
      paymentIntent = await StripeService.createGooglePayPaymentIntent(amount, currency, meta);
    } else {
      paymentIntent = await StripeService.createPaymentIntent(amount, currency, meta);
    }

    res.json(responses.ok({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }));
  } catch (error) {
    console.error('[PAYMENTS] createIntentGuest ERROR:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      response: error?.response?.data
    });
    res.status(500).json(responses.internalError('Failed to create payment intent'));
  }
};

const processGuest = async (req, res) => {
  try {
    console.log('[PAYMENTS] processGuest — from frontend:', JSON.stringify({
      bodyKeys: Object.keys(req.body || {}),
      guest: req.body?.guest ? { email: req.body.guest.email, name: req.body.guest.name, phone: req.body.guest.phone ? '(set)' : '(missing)' } : null,
      address: req.body?.address ? { line1: req.body.address.line1, city: req.body.address.city, postal_code: req.body.address.postal_code, phone: req.body.address.phone ? '(set)' : '(missing)' } : null,
      cart: req.body?.cart ? { itemsCount: req.body.cart.items?.length, subtotal: req.body.cart.subtotal } : null,
      shipping: req.body?.shipping ? { cost: req.body.shipping.cost, methodId: req.body.shipping.method?.id } : null,
      payment: req.body?.payment ? { method: req.body.payment.method, hasPaymentIntentId: !!req.body.payment.paymentIntentId } : null,
      promoCode: req.body?.promoCode ? { code: req.body.promoCode.code } : null
    }, null, 2));

    const { guest, cart, address, shipping, payment, totals, promoCode } = req.body;

    if (!guest?.email || !guest?.name || !guest?.phone) {
      console.error('[PAYMENTS] processGuest ERROR: Missing guest fields —', { hasEmail: !!guest?.email, hasName: !!guest?.name, hasPhone: !!guest?.phone });
    }
    if (!cart?.items?.length) {
      console.error('[PAYMENTS] processGuest ERROR: Cart empty or missing items —', { itemsLength: cart?.items?.length });
    }

    // Block guest checkout if this email is already a registered (non-guest) account
    const existingRegistered = await User.findRegisteredUserByEmail(guest?.email);
    if (existingRegistered) {
      console.log('[PAYMENTS] processGuest — 400 ACCOUNT_EXISTS_PLEASE_LOGIN:', { email: guest.email });
      return res.status(400).json(responses.error('ACCOUNT_EXISTS_PLEASE_LOGIN', 'An account with this email already exists. Please login first.'));
    }

    // Validate cart items and calculate expected total
    let expectedSubtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Order.getProductWithVariant(item.productId, item.variant.id);
      if (!product) {
        console.error('[PAYMENTS] processGuest — 400 PRODUCT_NOT_FOUND:', { productId: item.productId });
        return res.status(400).json(responses.error('PRODUCT_NOT_FOUND', `Product not found: ${item.productId}`));
      }

      const availableStock = item.variant.id ? product.variant_stock : product.stock;
      if (availableStock < item.quantity) {
        console.error('[PAYMENTS] processGuest — 400 INSUFFICIENT_STOCK:', { productName: product.name, required: item.quantity, available: availableStock });
        return res.status(400).json(responses.error('INSUFFICIENT_STOCK', `Insufficient stock for product: ${product.name}`));
      }

      const unitPrice = parseFloat(item.price) + parseFloat(item.variant.extra_price || 0);
      const itemTotal = unitPrice * item.quantity;
      expectedSubtotal += itemTotal;

      orderItems.push({
        product_id: item.productId,
        variant_id: item.variant.id,
        quantity: item.quantity,
        unit_price: unitPrice
      });
    }

    const expectedTax = 0;
    let expectedShipping = shipping.cost;
    if (expectedSubtotal >= config.pricing.freeShippingThreshold) {
      expectedShipping = 0;
    }

    let discountAmount = 0;
    if (promoCode && promoCode.discountAmount) {
      discountAmount = parseFloat(promoCode.discountAmount);
    }

    const expectedTotal = expectedSubtotal + expectedTax + expectedShipping - discountAmount;

    // Process payment
    let paymentResult;
    if (payment?.method === "paypal") {
      const orderId = payment?.paymentIntentId;
      if (!orderId) {
        console.error('[PAYMENTS] processGuest — 400 PAYPAL_ORDER_ID_REQUIRED: payment.paymentIntentId missing');
        return res.status(400).json(responses.error('PAYPAL_ORDER_ID_REQUIRED', 'Missing PayPal order ID for capture'));
      }
      const captureResult = await capturePaypalOrder(orderId);
      if (!captureResult.success) {
        console.error('[PAYMENTS] processGuest — 400 PAYMENT_FAILED (PayPal capture):', { message: captureResult.message, orderId });
        return res.status(400).json(responses.error('PAYMENT_FAILED', captureResult.message || 'Failed to capture PayPal payment'));
      }
      paymentResult = {
        success: true,
        paymentIntent: { id: captureResult.data?.id || orderId },
        chargeId: null,
        paymentDetails: captureResult.data
      };
      payment.paymentResp = { orderID: orderId, paymentID: captureResult.data?.id };
    } else {
      paymentResult = await StripeService.processPayment(
        payment,
        expectedTotal,
        config.currency.default,
        {
          guest_checkout: true,
          guest_email: guest.email,
          order_items: orderItems.length,
          subtotal: expectedSubtotal,
          shipping: expectedShipping,
          tax: expectedTax,
          payment_method: payment.method
        }
      );
    }

    if (!paymentResult.success) {
      console.error('[PAYMENTS] processGuest — 400 PAYMENT_FAILED (Stripe/other):', { error: paymentResult.error });
      return res.status(400).json(responses.error('PAYMENT_FAILED', paymentResult.error));
    }

    // Find or create guest user
    const guestUser = await User.findOrCreateGuest({
      name: guest.name,
      email: guest.email,
      phone: guest.phone
    });

    const user_id = guestUser.id;

    // Create payment record
    const paymentData = {
      order_id: null,
      stripe_payment_intent_id: paymentResult.paymentIntent?.id || paymentResult.charge?.payment_intent || paymentResult?.paymentIntent?.id,
      stripe_charge_id: paymentResult.chargeId || paymentResult?.paymentDetails?.id || null,
      amount: expectedTotal,
      currency: config.currency.default,
      status: 'succeeded',
      payment_method: payment.method,
      payment_method_details: payment.method === 'paypal' ? { method: 'paypal' } : (payment.method === 'googlePay' ? { method: 'googlePay' } : (payment.method === 'klarna' ? { method: 'klarna' } : (payment.method === 'link' ? { method: 'link' } : payment.cardDetails))),
      metadata: {
        user_id,
        guest_checkout: true,
        order_items: orderItems.length,
        subtotal: expectedSubtotal,
        tax: expectedTax,
        shipping: expectedShipping,
        payment_method: payment.method
      }
    };

    const paymentRecord = await Payment.create(paymentData);

    // Prepare order data
    const orderData = {
      user_id,
      items: orderItems,
      address_id: null,
      shipment: {
        method_value_id: shipping.method.id,
        scheduled_date: null,
        cost: shipping.cost
      },
      payment_method_value_id: null,
      discount_type_value_id: null,
      notes: null,
      payment_id: paymentRecord.id,
      address_snapshot: {
        label: address.label || 'Guest',
        recipient_name: guest.name,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state_region: address.state_region || null,
        postal_code: address.postal_code,
        phone: address.phone
      },
      subtotal: expectedSubtotal,
      tax: expectedTax,
      shipping: expectedShipping,
      total: expectedTotal,
      promoCode: promoCode ? {
        code: promoCode.code,
        discountAmount: discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        promoCodeId: null
      } : null
    };

    const order = await Order.create(orderData);
    console.log('[PAYMENTS] processGuest — success:', { orderId: order.id, orderCode: order.code, user_id, guestEmail: guest.email });

    // Send order confirmation email in background
    setImmediate(async () => {
      try {
        if (guest.email) {
          const orderWithItems = await Order.findById(order.id);
          const emailData = {
            userEmail: guest.email,
            userName: guest.name,
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
                state_region: address.state_region,
                postal_code: address.postal_code,
                phone: address.phone
              },
              promoCode: promoCode ? {
                code: promoCode.code,
                discountAmount: discountAmount,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue
              } : null
            }
          };
          await EmailService.sendOrderConfirmation(emailData);
        }
      } catch (emailError) {
        console.error('Guest order confirmation email error:', emailError);
      }
    });

    res.status(201).json(responses.created({
      order,
      payment: {
        id: paymentRecord.id,
        status: paymentRecord.status,
        amount: paymentRecord.amount,
        stripe_payment_intent_id: paymentRecord.stripe_payment_intent_id
      },
      totals: {
        subtotal: expectedSubtotal,
        tax: expectedTax,
        shipping: expectedShipping,
        total: expectedTotal
      },
      promoCode: promoCode ? {
        code: promoCode.code,
        discountAmount: discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue
      } : null
    }));
  } catch (error) {
    console.error('[PAYMENTS] processGuest ERROR:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      response: error?.response?.data,
      apiMessage: error?.apiMessage
    });
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
      res.status(400).json(responses.error('ORDER_ERROR', error.message));
    } else {
      res.status(500).json(responses.internalError('Failed to process guest payment'));
    }
  }
};

/** Check if guest checkout is allowed for this email (not already a registered account). Public, no auth. */
const checkGuestEmail = async (req, res) => {
  try {
    const email = (req.body?.email || req.query?.email || '').trim();
    if (!email) {
      return res.status(400).json(responses.error('EMAIL_REQUIRED', 'Email is required'));
    }
    const existingRegistered = await User.findRegisteredUserByEmail(email);
    if (existingRegistered) {
      return res.json(responses.ok({
        allowed: false,
        message: 'An account with this email already exists. Please login first.'
      }));
    }
    return res.json(responses.ok({ allowed: true }));
  } catch (error) {
    console.error('[PAYMENTS] checkGuestEmail ERROR:', { message: error?.message, stack: error?.stack });
    res.status(500).json(responses.internalError('Failed to check email'));
  }
};

module.exports = {
  createIntent,
  process,
  getById,
  registerDomain,
  listDomains,
  createPaypalOrder,
  getConfig,
  createIntentGuest,
  processGuest,
  checkGuestEmail
};
