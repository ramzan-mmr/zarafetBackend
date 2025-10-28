const db = require('../config/db');
const config = require('../config/env');

class Payment {
  /**
   * Create a new payment record
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} Created payment record
   */
  static async create(paymentData) {
    const {
      order_id,
      stripe_payment_intent_id,
      stripe_charge_id,
      amount,
      currency = config.currency.default,
      status = 'pending',
      payment_method,
      payment_method_details,
      metadata
    } = paymentData;

    try {
      const [result] = await db.execute(
        `INSERT INTO payments (
          order_id, stripe_payment_intent_id, stripe_charge_id, amount, currency, 
          status, payment_method, payment_method_details, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order_id,
          stripe_payment_intent_id,
          stripe_charge_id,
          amount,
          currency,
          status,
          payment_method,
          payment_method_details ? JSON.stringify(payment_method_details) : null,
          metadata ? JSON.stringify(metadata) : null
        ]
      );

      return this.findById(result.insertId);
    } catch (error) {
      console.error('Payment create error:', error);
      throw new Error('Failed to create payment record');
    }
  }

  /**
   * Find payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<object|null>} Payment record
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM payments WHERE id = ?',
        [id]
      );

      if (!rows[0]) return null;

      const payment = rows[0];
      
      // Parse JSON fields
      if (payment.payment_method_details) {
        payment.payment_method_details = JSON.parse(payment.payment_method_details);
      }
      if (payment.metadata) {
        payment.metadata = JSON.parse(payment.metadata);
      }

      return payment;
    } catch (error) {
      console.error('Payment findById error:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  /**
   * Find payment by Stripe payment intent ID
   * @param {string} stripePaymentIntentId - Stripe payment intent ID
   * @returns {Promise<object|null>} Payment record
   */
  static async findByStripePaymentIntent(stripePaymentIntentId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM payments WHERE stripe_payment_intent_id = ?',
        [stripePaymentIntentId]
      );

      if (!rows[0]) return null;

      const payment = rows[0];
      
      // Parse JSON fields
      if (payment.payment_method_details) {
        payment.payment_method_details = JSON.parse(payment.payment_method_details);
      }
      if (payment.metadata) {
        payment.metadata = JSON.parse(payment.metadata);
      }

      return payment;
    } catch (error) {
      console.error('Payment findByStripePaymentIntent error:', error);
      throw new Error('Failed to fetch payment by Stripe ID');
    }
  }

  /**
   * Update payment status
   * @param {number} id - Payment ID
   * @param {string} status - New status
   * @param {string} stripeChargeId - Stripe charge ID (optional)
   * @returns {Promise<object>} Updated payment record
   */
  static async updateStatus(id, status, stripeChargeId = null) {
    try {
      const updateFields = ['status = ?'];
      const values = [status];

      if (stripeChargeId) {
        updateFields.push('stripe_charge_id = ?');
        values.push(stripeChargeId);
      }

      values.push(id);

      await db.execute(
        `UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return this.findById(id);
    } catch (error) {
      console.error('Payment updateStatus error:', error);
      throw new Error('Failed to update payment status');
    }
  }

  /**
   * Find payments by order ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} Payment records
   */
  static async findByOrderId(orderId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
        [orderId]
      );

      return rows.map(payment => {
        // Parse JSON fields
        if (payment.payment_method_details) {
          payment.payment_method_details = JSON.parse(payment.payment_method_details);
        }
        if (payment.metadata) {
          payment.metadata = JSON.parse(payment.metadata);
        }
        return payment;
      });
    } catch (error) {
      console.error('Payment findByOrderId error:', error);
      throw new Error('Failed to fetch payments by order');
    }
  }

  /**
   * Get payment statistics
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Payment statistics
   */
  static async getStats(filters = {}) {
    try {
      let whereClause = '';
      const values = [];

      if (filters.status) {
        whereClause = 'WHERE status = ?';
        values.push(filters.status);
      }

      const [rows] = await db.execute(
        `SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_amount,
          AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END) as average_amount
         FROM payments ${whereClause}`,
        values
      );

      return rows[0];
    } catch (error) {
      console.error('Payment getStats error:', error);
      throw new Error('Failed to fetch payment statistics');
    }
  }
}

module.exports = Payment;
