const db = require('../config/db');

class RecentlyViewed {
  static async add(user_id, product_id) {
    // Remove existing entry if it exists
    await db.execute(
      'DELETE FROM recently_viewed WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    
    // Add new entry
    await db.execute(
      'INSERT INTO recently_viewed (user_id, product_id) VALUES (?, ?)',
      [user_id, product_id]
    );
    
    return true;
  }
  
  static async findAll(user_id, limit = 10) {
    const [rows] = await db.execute(
      `SELECT rv.*, 
              p.name as product_name,
              p.price,
              p.sku,
              p.status as product_status,
              c.name as category_name,
              lv2.value as brand_name
       FROM recently_viewed rv 
       LEFT JOIN products p ON rv.product_id = p.id
       LEFT JOIN categories c ON p.category_value_id = c.id
       LEFT JOIN lookup_values lv2 ON p.brand_value_id = lv2.id
       WHERE rv.user_id = ? AND p.status = 'Active'
       ORDER BY rv.viewed_at DESC
       LIMIT ?`,
      [user_id, limit]
    );
    return rows;
  }
  
  static async clear(user_id) {
    await db.execute(
      'DELETE FROM recently_viewed WHERE user_id = ?',
      [user_id]
    );
    return true;
  }
}

module.exports = RecentlyViewed;
