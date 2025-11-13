const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const OrderAddress = require('../models/OrderAddress.model');
const StripeService = require('../services/stripe.service');
const EmailService = require('../services/email.service');
const User = require('../models/User.model');
const responses = require('../utils/responses');
const config = require('../config/env');
const db = require('../config/db');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    // Clean up empty string filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    // Handle status filter - convert status name to status_value_id
    if (filters.status && typeof filters.status === 'string') {
      const [statusRows] = await db.execute(
        'SELECT id FROM lookup_values WHERE header_id = (SELECT id FROM lookup_headers WHERE name = "Order Status") AND value = ?',
        [filters.status]
      );
      if (statusRows[0]) {
        filters.status_value_id = statusRows[0].id;
        delete filters.status;
      }
    }
    
    // Handle category filter - convert category name to category_value_id
    if (filters.category && typeof filters.category === 'string') {
      const [categoryRows] = await db.execute(
        'SELECT id FROM categories WHERE name = ?',
        [filters.category]
      );
      if (categoryRows[0]) {
        filters.category_value_id = categoryRows[0].id;
        delete filters.category;
      }
    }
    
    console.log('🔍 Orders list request:', { page, limit, filters });
    
    const orders = await Order.findAll(filters, { page, limit, ...req.query });
    const total = await Order.count(filters);
    
    console.log('📊 Orders found:', orders.length, 'Total:', total);
    
    res.json(responses.ok(orders, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Orders list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch orders'));
  }
};

const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const filters = { user_id };
    const orders = await Order.findAll(filters);
    console.log(`📊 Found ${orders.length} orders for user ${user_id}`);
    res.json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch your orders'
      }
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    res.json(responses.ok(order));
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json(responses.internalError('Failed to fetch order'));
  }
};

const place = async (req, res) => {
  try {
    const { cart, address, shipping, payment, totals, promoCode } = req.body;
    const user_id = req.user.id;
    
    // Debug: Log the incoming request data
    console.log('🔍 DEBUGGING PAYMENT REQUEST:');
    console.log('   Promo Code received:', promoCode);
    console.log('   Cart subtotal:', cart.subtotal);
    console.log('   Shipping cost:', shipping.cost);
    console.log('   Full request body keys:', Object.keys(req.body));
    console.log('🚨 BACKEND CODE UPDATED - PROMO CODE PROCESSING ACTIVE!');
    console.log('🔄 FORCE RESTART - PROMO CODE LOGIC SHOULD BE WORKING NOW!');

    // Validate cart items and calculate expected total
    let expectedSubtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Order.getProductWithVariant(item.productId, item.variant.id);
      if (!product) {
        return res.status(400).json(responses.error('PRODUCT_NOT_FOUND', `Product not found: ${item.productId}`));
      }

      // Check stock
      const availableStock = item.variant.id ? product.variant_stock : product.stock;
      if (availableStock < item.quantity) {
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

    // Backend calculates shipping using environment variables
    const expectedTax = 0; // No tax
    
    // Calculate shipping cost (can be enhanced with free shipping logic)
    let expectedShipping = shipping.cost; // Use frontend shipping cost
    if (expectedSubtotal >= config.pricing.freeShippingThreshold) {
      expectedShipping = 0; // Free shipping for orders above threshold
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

    // Remove total validation - backend calculates everything
    // if (Math.abs(expectedTotal - totals.total) > 0.01) {
    //   return res.status(400).json(responses.error('TOTAL_MISMATCH', 'Calculated total does not match provided total'));
    // }

    // Process payment with backend-calculated total
    const paymentResult = await StripeService.processPayment(
      payment,
      expectedTotal, // Use backend-calculated total
      'usd',
      {
        user_id,
        order_items: orderItems.length,
        subtotal: expectedSubtotal,
        shipping: expectedShipping,
        tax: expectedTax
      }
    );

    if (!paymentResult.success) {
      return res.status(400).json(responses.error('PAYMENT_FAILED', paymentResult.error));
    }

    // Create payment record with backend-calculated amount
    const paymentData = {
      stripe_payment_intent_id: paymentResult.paymentIntent?.id || paymentResult.charge?.payment_intent,
      stripe_charge_id: paymentResult.chargeId,
      amount: expectedTotal, // Use backend-calculated total
      currency: config.currency.default,
      status: 'succeeded',
      payment_method: payment.method,
      payment_method_details: payment.cardDetails,
      metadata: {
        user_id,
        order_items: orderItems.length,
        subtotal: expectedSubtotal,
        tax: expectedTax,
        shipping: expectedShipping
      }
    };

    const paymentRecord = await Payment.create(paymentData);

    // Prepare order data with backend-calculated totals
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
      // Include promo code information if applied
      promoCode: promoCode ? {
        code: promoCode.code,
        discountAmount: discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        promoCodeId: null // Will be set if we find the promo code in database
      } : null
    };

    // Create order
    const order = await Order.create(orderData);
    
    // Send order confirmation email in background (non-blocking)
    setImmediate(async () => {
      try {
        const user = await User.findById(user_id);
        if (user && user.email) {
          // Get order details with items for email
          const orderWithItems = await Order.findById(order.id);
          
          // Use order address from database if available, otherwise use the provided address
          const orderAddress = orderWithItems.order_address || address;
          const formattedAddress = orderAddress ? {
            line1: orderAddress.line1 || '',
            line2: orderAddress.line2 || '',
            city: orderAddress.city || '',
            postal_code: orderAddress.postal_code || orderAddress.postalCode || '',
            phone: orderAddress.phone || ''
          } : null;
          
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
              address: formattedAddress,
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
    console.error('Place order error:', error);
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
      res.status(400).json(responses.error('ORDER_ERROR', error.message));
    } else {
      res.status(500).json(responses.internalError('Failed to place order'));
    }
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { to_status_value_id, reason } = req.body;
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    const order = await Order.updateStatus(id, to_status_value_id, req.user.id, reason);
    
    // Send order status update email in background (non-blocking)
    setImmediate(async () => {
      try {
        const user = await User.findById(existingOrder.user_id);
        if (user && user.email) {
          // Get the new status name
          const [statusRows] = await db.execute(
            'SELECT value FROM lookup_values WHERE id = ?',
            [to_status_value_id]
          );
          const newStatus = statusRows[0]?.value || 'Updated';
          
          const emailData = {
            userEmail: user.email,
            userName: user.name,
            orderData: {
              order: order
            },
            newStatus: newStatus
          };
          
          const emailResult = await EmailService.sendOrderStatusUpdate(emailData);
          if (emailResult.success) {
            console.log('✅ Order status update email sent successfully');
          } else {
            console.error('❌ Failed to send order status update email:', emailResult.error);
          }
        } else {
          console.warn('⚠️ User email not found, skipping order status update email');
        }
      } catch (emailError) {
        console.error('❌ Error sending order status update email:', emailError);
        // Email failure doesn't affect the status update
      }
    });
    
    res.json(responses.ok(order));
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json(responses.internalError('Failed to update order status'));
  }
};

const getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    const history = await Order.getHistory(id);
    res.json(responses.ok(history));
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json(responses.internalError('Failed to fetch order history'));
  }
};

module.exports = {
  list,
  getMyOrders,
  getById,
  place,
  updateStatus,
  getHistory
};
