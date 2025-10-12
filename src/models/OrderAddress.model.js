const db = require('../config/db');

class OrderAddress {
  /**
   * Create a new order address record (snapshot of address at order time)
   * @param {object} addressData - Address data
   * @returns {Promise<object>} Created order address record
   */
  static async create(addressData) {
    const {
      order_id,
      label,
      line1,
      line2,
      city,
      postal_code,
      phone
    } = addressData;

    try {
      const [result] = await db.execute(
        `INSERT INTO order_addresses (
          order_id, label, line1, line2, city, postal_code, phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_id, label, line1, line2, city, postal_code, phone]
      );

      return this.findById(result.insertId);
    } catch (error) {
      console.error('OrderAddress create error:', error);
      throw new Error('Failed to create order address record');
    }
  }

  /**
   * Find order address by ID
   * @param {number} id - Order address ID
   * @returns {Promise<object|null>} Order address record
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM order_addresses WHERE id = ?',
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('OrderAddress findById error:', error);
      throw new Error('Failed to fetch order address');
    }
  }

  /**
   * Find order address by order ID
   * @param {number} orderId - Order ID
   * @returns {Promise<object|null>} Order address record
   */
  static async findByOrderId(orderId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM order_addresses WHERE order_id = ?',
        [orderId]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('OrderAddress findByOrderId error:', error);
      throw new Error('Failed to fetch order address by order ID');
    }
  }

  /**
   * Update order address
   * @param {number} id - Order address ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} Updated order address record
   */
  static async update(id, updateData) {
    try {
      const allowedFields = ['label', 'line1', 'line2', 'city', 'postal_code', 'phone'];
      const updateFields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);

      await db.execute(
        `UPDATE order_addresses SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return this.findById(id);
    } catch (error) {
      console.error('OrderAddress update error:', error);
      throw new Error('Failed to update order address');
    }
  }

  /**
   * Delete order address
   * @param {number} id - Order address ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM order_addresses WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrderAddress delete error:', error);
      throw new Error('Failed to delete order address');
    }
  }

  /**
   * Get all order addresses with pagination
   * @param {object} filters - Filter options
   * @param {object} pagination - Pagination options
   * @returns {Promise<Array>} Order address records
   */
  static async findAll(filters = {}, pagination = {}) {
    try {
      const { buildWhereClause, buildPaginationClause } = require('../utils/sql');
      
      const allowedColumns = ['order_id', 'city', 'postal_code'];
      const { whereClause, values } = buildWhereClause(filters, allowedColumns);
      const paginationClause = buildPaginationClause(pagination.page, pagination.limit);

      const query = `
        SELECT oa.*, o.code as order_code, o.created_at as order_date
        FROM order_addresses oa
        LEFT JOIN orders o ON oa.order_id = o.id
        ${whereClause}
        ORDER BY oa.created_at DESC
        ${paginationClause}
      `;

      const [rows] = await db.execute(query, values);
      return rows;
    } catch (error) {
      console.error('OrderAddress findAll error:', error);
      throw new Error('Failed to fetch order addresses');
    }
  }

  /**
   * Count order addresses
   * @param {object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  static async count(filters = {}) {
    try {
      const { buildWhereClause } = require('../utils/sql');
      const allowedColumns = ['order_id', 'city', 'postal_code'];
      const { whereClause, values } = buildWhereClause(filters, allowedColumns);

      const [rows] = await db.execute(
        `SELECT COUNT(*) as total FROM order_addresses oa ${whereClause}`,
        values
      );

      return rows[0].total;
    } catch (error) {
      console.error('OrderAddress count error:', error);
      throw new Error('Failed to count order addresses');
    }
  }
}

module.exports = OrderAddress;
