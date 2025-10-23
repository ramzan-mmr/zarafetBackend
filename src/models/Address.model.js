const db = require('../config/db');

class Address {
  static async create(addressData) {
    const { user_id, label, line1, line2, city, postal_code, phone, is_default } = addressData;
    
    // If this is set as default, unset other defaults
    if (is_default) {
      await db.execute(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [user_id]
      );
    }
    
    const [result] = await db.execute(
      `INSERT INTO addresses (user_id, label, line1, line2, city, postal_code, phone, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, label, line1, line2, city, postal_code, phone, is_default]
    );
    
    return this.findById(result.insertId);
  }
  
  static async findAll(user_id) {
    const [rows] = await db.execute(
      `SELECT a.*, a.city as city_name
       FROM addresses a 
       WHERE a.user_id = ? 
       ORDER BY a.is_default DESC, a.id DESC`,
      [user_id]
    );
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT a.*, a.city as city_name
       FROM addresses a 
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  
  static async update(id, updateData) {
    const { is_default, user_id } = updateData;
    
    // If this is set as default, unset other defaults for the same user
    if (is_default && user_id) {
      await db.execute(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?',
        [user_id, id]
      );
    }
    
    const fields = [];
    const values = [];
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    
    await db.execute(
      `UPDATE addresses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await db.execute('DELETE FROM addresses WHERE id = ?', [id]);
    return true;
  }
  
  static async getDefault(user_id) {
    const [rows] = await db.execute(
      `SELECT a.*, a.city as city_name
       FROM addresses a 
       WHERE a.user_id = ? AND a.is_default = 1`,
      [user_id]
    );
    return rows[0] || null;
  }
}

module.exports = Address;
