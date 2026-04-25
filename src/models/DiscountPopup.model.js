const db = require('../config/db');

class DiscountPopup {
  /**
   * Find all discount popups, ordered by created_at DESC
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM discount_popups';
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Find a discount popup by ID
   */
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM discount_popups WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Find the currently active discount popup (only 1)
   */
  static async findActive() {
    const [rows] = await db.execute(
      'SELECT * FROM discount_popups WHERE status = ? ORDER BY created_at DESC LIMIT 1',
      ['Active']
    );
    return rows[0] || null;
  }

  /**
   * Get count of all discount popups
   */
  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM discount_popups');
    return rows[0].total;
  }

  /**
   * Create a new discount popup
   */
  static async create(data) {
    const { title, image_url, status, created_by } = data;

    const [result] = await db.execute(
      `INSERT INTO discount_popups (title, image_url, status, created_by)
       VALUES (?, ?, ?, ?)`,
      [title, image_url, status || 'Active', created_by || null]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update a discount popup
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(data.image_url);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE discount_popups SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  /**
   * Delete a discount popup
   */
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM discount_popups WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = DiscountPopup;
