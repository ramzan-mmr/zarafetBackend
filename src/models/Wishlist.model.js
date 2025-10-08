const db = require('../config/db');

class Wishlist {
  static async add(user_id, product_id) {
    try {
      await db.execute(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
        [user_id, product_id]
      );
      return true;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return false; // Already in wishlist
      }
      throw error;
    }
  }
  
  static async remove(user_id, product_id) {
    const [result] = await db.execute(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    return result.affectedRows > 0;
  }
  
  static async findAll(user_id) {
    const [rows] = await db.execute(
      `SELECT w.*, 
              p.name as product_name,
              p.price,
              p.sku,
              p.status as product_status,
              c.name as category_name,
              lv2.value as brand_name
       FROM wishlists w 
       LEFT JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_value_id = c.id
       LEFT JOIN lookup_values lv2 ON p.brand_value_id = lv2.id
       WHERE w.user_id = ? AND p.status = 'Active'
       ORDER BY w.created_at DESC`,
      [user_id]
    );
    return rows;
  }
  
  static async isInWishlist(user_id, product_id) {
    const [rows] = await db.execute(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    return rows.length > 0;
  }
}

module.exports = Wishlist;
