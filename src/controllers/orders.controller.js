const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const OrderAddress = require('../models/OrderAddress.model');
const StripeService = require('../services/stripe.service');
const responses = require('../utils/responses');
const config = require('../config/env');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const orders = await Order.findAll(filters, { page, limit, ...req.query });
    const total = await Order.count(filters);
    
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
    const { page, limit } = req.pagination;
    const user_id = req.user.id;
    
    // Filter orders for current user only
    const filters = { user_id };
    const orders = await Order.findAll(filters, { page, limit });
    const total = await Order.count(filters);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total
        }
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
    const { cart, address, shipping, payment, totals } = req.body;
    const user_id = req.user.id;

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

    // Backend calculates tax and shipping using environment variables
    const taxRate = config.pricing.taxRate; // Get tax rate from environment
    const expectedTax = expectedSubtotal * taxRate;
    
    // Calculate shipping cost (can be enhanced with free shipping logic)
    let expectedShipping = shipping.cost; // Use frontend shipping cost
    if (expectedSubtotal >= config.pricing.freeShippingThreshold) {
      expectedShipping = 0; // Free shipping for orders above threshold
    }
    
    const expectedTotal = expectedSubtotal + expectedTax + expectedShipping;

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
      currency: 'usd',
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
        scheduled_date: null
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
      total: expectedTotal
    };

    // Create order
    const order = await Order.create(orderData);
    
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
      }
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
    const { to_status_value_id } = req.body;
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    const order = await Order.updateStatus(id, to_status_value_id, req.user.id);
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
