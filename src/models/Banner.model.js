const db = require('../config/db');

class Banner {
  /**
   * Find all banners, ordered by sort_order
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM hero_banners';
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sort_order ASC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Find a banner by ID
   */
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM hero_banners WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Get count of all banners (for max-3 enforcement)
   */
  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM hero_banners');
    return rows[0].total;
  }

  /**
   * Create a new banner
   */
  static async create(data) {
    const { title, tagline, image_url, sort_order, status, created_by } = data;

    const [result] = await db.execute(
      `INSERT INTO hero_banners (title, tagline, image_url, sort_order, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, tagline || null, image_url, sort_order || 1, status || 'Active', created_by || null]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update a banner
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title);
    }
    if (data.tagline !== undefined) {
      fields.push('tagline = ?');
      params.push(data.tagline);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(data.image_url);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      params.push(data.sort_order);
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
      `UPDATE hero_banners SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  /**
   * Delete a banner
   */
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM hero_banners WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Get the next available sort_order
   */
  static async getNextSortOrder() {
    const [rows] = await db.execute('SELECT MAX(sort_order) as maxOrder FROM hero_banners');
    return (rows[0].maxOrder || 0) + 1;
  }
}

module.exports = Banner;
