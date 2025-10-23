const db = require('../config/db');

class PromoCode {
  static async create(promoData) {
    const { code, discount_type, discount_value, status = 'active', expiry_date, description } = promoData;
    
    const [result] = await db.execute(
      `INSERT INTO promo_codes (code, discount_type, discount_value, status, expiry_date, description, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [code, discount_type, discount_value, status, expiry_date, description]
    );
    
    return result.insertId;
  }
  
  static async findAll(filters = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['status', 'discount_type'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause('created_at', 'desc');
    const paginationClause = buildPaginationClause(filters.page || 1, filters.limit || 10);
    
    const query = `
      SELECT * FROM promo_codes 
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM promo_codes WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  static async findByCode(code) {
    const [rows] = await db.execute(
      'SELECT * FROM promo_codes WHERE code = ? AND status = "active" AND (expiry_date IS NULL OR expiry_date > NOW())',
      [code]
    );
    return rows[0];
  }
  
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const [result] = await db.execute(
      `UPDATE promo_codes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM promo_codes WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    
    const allowedColumns = ['status', 'discount_type'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM promo_codes ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  // Validate promo code for checkout
  static async validateForCheckout(code, cartTotal) {
    const promoCode = await this.findByCode(code);
    
    if (!promoCode) {
      return {
        valid: false,
        message: 'Invalid or expired promo code'
      };
    }
    
    let discountAmount = 0;
    
    if (promoCode.discount_type === 'percentage') {
      discountAmount = (cartTotal * promoCode.discount_value) / 100;
    } else if (promoCode.discount_type === 'fixed') {
      discountAmount = promoCode.discount_value;
    }
    
    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }
    
    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discount_type: promoCode.discount_type,
        discount_value: promoCode.discount_value,
        description: promoCode.description
      }
    };
  }
}

module.exports = PromoCode;
