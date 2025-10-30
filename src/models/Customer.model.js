const db = require('../config/db');

class Customer {
  static async findAll(filters = {}, pagination = {}) {
    const { buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    // Build custom where clause for customer-specific columns
    const conditions = [];
    const values = [];
    
    // Handle status filter
    if (filters.status) {
      conditions.push('u.status = ?');
      values.push(filters.status);
    }
    
    // Handle tier filter
    if (filters.tier_value_id) {
      conditions.push('cp.tier_value_id = ?');
      values.push(filters.tier_value_id);
    }
    
    // Handle search filter (by name, email, or customer code)
    if (filters.search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.code LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    // Handle order count range
    if (filters.minOrders !== undefined) {
      conditions.push('COALESCE(os.total_orders, 0) >= ?');
      values.push(Number(filters.minOrders));
    }
    if (filters.maxOrders !== undefined) {
      conditions.push('COALESCE(os.total_orders, 0) <= ?');
      values.push(Number(filters.maxOrders));
    }

    // Handle spend range
    if (filters.minSpend !== undefined) {
      conditions.push('COALESCE(os.total_spend, 0) >= ?');
      values.push(Number(filters.minSpend));
    }
    if (filters.maxSpend !== undefined) {
      conditions.push('COALESCE(os.total_spend, 0) <= ?');
      values.push(Number(filters.maxSpend));
    }

    // Handle registration date range (created_at on users table)
    if (filters.from) {
      conditions.push('u.created_at >= ?');
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push('u.created_at <= ?');
      values.push(filters.to);
    }
    
    const whereClause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'created_at', 'last_login_at']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT 
        u.*, 
        COALESCE(
          u.phone,
          (SELECT a.phone FROM addresses a WHERE a.user_id = u.id AND a.is_default = 1 ORDER BY a.id DESC LIMIT 1),
          (SELECT a2.phone FROM addresses a2 WHERE a2.user_id = u.id ORDER BY a2.id DESC LIMIT 1)
        ) AS phone,
        COALESCE(os.total_orders, 0) AS total_orders,
        COALESCE(os.total_spend, 0) AS total_spend,
        os.last_order_at,
        cp.points,
        cp.tier_value_id,
        cp.reg_date,
        lv.value as tier_name,
        r.name as role_name
      FROM users u 
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      LEFT JOIN (
        SELECT o.user_id, COUNT(*) AS total_orders, COALESCE(SUM(o.total), 0) AS total_spend, MAX(o.created_at) AS last_order_at
        FROM orders o
        GROUP BY o.user_id
      ) os ON os.user_id = u.id
      LEFT JOIN lookup_values lv ON cp.tier_value_id = lv.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'Customer'
      ${whereClause}
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(user_id) {
    const [rows] = await db.execute(
      `SELECT 
          u.*, 
          COALESCE(
            u.phone,
            (SELECT a.phone FROM addresses a WHERE a.user_id = u.id AND a.is_default = 1 ORDER BY a.id DESC LIMIT 1),
            (SELECT a2.phone FROM addresses a2 WHERE a2.user_id = u.id ORDER BY a2.id DESC LIMIT 1)
          ) AS phone,
          COALESCE(os.total_orders, 0) AS total_orders,
          COALESCE(os.total_spend, 0) AS total_spend,
          os.last_order_at,
          cp.points, 
          cp.tier_value_id,
          cp.reg_date,
          lv.value as tier_name,
          r.name as role_name
       FROM users u 
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       LEFT JOIN (
         SELECT o.user_id, COUNT(*) AS total_orders, COALESCE(SUM(o.total), 0) AS total_spend, MAX(o.created_at) AS last_order_at
         FROM orders o
         GROUP BY o.user_id
       ) os ON os.user_id = u.id
       LEFT JOIN lookup_values lv ON cp.tier_value_id = lv.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND r.name = 'Customer'`,
      [user_id]
    );
    return rows[0] || null;
  }
  
  static async count(filters = {}) {
    // Build custom where clause for customer-specific columns
    const conditions = [];
    const values = [];
    
    // Handle status filter
    if (filters.status) {
      conditions.push('u.status = ?');
      values.push(filters.status);
    }
    
    // Handle tier filter
    if (filters.tier_value_id) {
      conditions.push('cp.tier_value_id = ?');
      values.push(filters.tier_value_id);
    }
    
    // Handle search filter (by name, email, or customer code)
    if (filters.search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.code LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    // Handle order count range
    if (filters.minOrders !== undefined) {
      conditions.push('COALESCE(os.total_orders, 0) >= ?');
      values.push(Number(filters.minOrders));
    }
    if (filters.maxOrders !== undefined) {
      conditions.push('COALESCE(os.total_orders, 0) <= ?');
      values.push(Number(filters.maxOrders));
    }

    // Handle spend range
    if (filters.minSpend !== undefined) {
      conditions.push('COALESCE(os.total_spend, 0) >= ?');
      values.push(Number(filters.minSpend));
    }
    if (filters.maxSpend !== undefined) {
      conditions.push('COALESCE(os.total_spend, 0) <= ?');
      values.push(Number(filters.maxSpend));
    }

    // Handle registration date range
    if (filters.from) {
      conditions.push('u.created_at >= ?');
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push('u.created_at <= ?');
      values.push(filters.to);
    }
    
    const whereClause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM users u 
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       LEFT JOIN (
         SELECT o.user_id, COUNT(*) AS total_orders, COALESCE(SUM(o.total), 0) AS total_spend
         FROM orders o
         GROUP BY o.user_id
       ) os ON os.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'Customer'
       ${whereClause}`,
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
