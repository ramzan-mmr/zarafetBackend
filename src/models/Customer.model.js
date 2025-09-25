const db = require('../config/db');

class Customer {
  static async findAll(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['status', 'tier_value_id'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'created_at', 'last_login_at']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT u.*, 
             cp.total_orders, 
             cp.total_spend, 
             cp.points, 
             cp.tier_value_id,
             cp.reg_date,
             cp.last_order_at,
             lv.value as tier_name,
             r.name as role_name
      FROM users u 
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      LEFT JOIN lookup_values lv ON cp.tier_value_id = lv.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'Customer'
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(user_id) {
    const [rows] = await db.execute(
      `SELECT u.*, 
              cp.total_orders, 
              cp.total_spend, 
              cp.points, 
              cp.tier_value_id,
              cp.reg_date,
              cp.last_order_at,
              lv.value as tier_name,
              r.name as role_name
       FROM users u 
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       LEFT JOIN lookup_values lv ON cp.tier_value_id = lv.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND r.name = 'Customer'`,
      [user_id]
    );
    return rows[0] || null;
  }
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    const allowedColumns = ['status', 'tier_value_id'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM users u 
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'Customer'
       ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}`,
      values
    );
    return rows[0].total;
  }
  
  static async update(user_id, updateData) {
    const { tier_value_id, ...userData } = updateData;
    
    // Update user data
    if (Object.keys(userData).length > 0) {
      const fields = [];
      const values = [];
      
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (fields.length > 0) {
        values.push(user_id);
        await db.execute(
          `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          values
        );
      }
    }
    
    // Update customer profile
    if (tier_value_id !== undefined) {
      await db.execute(
        'UPDATE customer_profiles SET tier_value_id = ? WHERE user_id = ?',
        [tier_value_id, user_id]
      );
    }
    
    return this.findById(user_id);
  }
  
  static async createProfile(user_id, tier_value_id = null) {
    await db.execute(
      `INSERT INTO customer_profiles (user_id, tier_value_id) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE tier_value_id = ?`,
      [user_id, tier_value_id, tier_value_id]
    );
  }
  
  static async updateStats(user_id, orderTotal) {
    await db.execute(
      `UPDATE customer_profiles 
       SET total_orders = total_orders + 1, 
           total_spend = total_spend + ?, 
           last_order_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [orderTotal, user_id]
    );
  }
}

module.exports = Customer;
