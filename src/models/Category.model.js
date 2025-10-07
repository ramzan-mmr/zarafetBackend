const db = require('../config/db');
const { generateCode } = require('../utils/sql');

class Category {
  static async create(categoryData) {
    const { 
      name, 
      description, 
      image_url, 
      parent_id, 
      sort_order = 1, 
      status = 'Active',
      created_by 
    } = categoryData;
    
    const [result] = await db.execute(
      `INSERT INTO categories (name, description, image_url, parent_id, sort_order, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, image_url || null, parent_id || null, sort_order, status, created_by]
    );
    
    // Generate code and update
    const code = generateCode('CAT', result.insertId);
    await db.execute(
      'UPDATE categories SET code = ? WHERE id = ?',
      [code, result.insertId]
    );
    
    return this.findById(result.insertId);
  }
  
  static async findAll(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['status', 'parent_id'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['sort_order', 'name', 'created_at']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT c.*, 
             p.name as parent_name,
             u.name as created_by_name
      FROM categories c 
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, 
              p.name as parent_name,
              u.name as created_by_name
       FROM categories c 
       LEFT JOIN categories p ON c.parent_id = p.id
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  
  // Removed: findByParent, findRootCategories, getHierarchy - keeping it simple
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    const allowedColumns = ['status', 'parent_id'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM categories c ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'sort_order') {
          fields.push('sort_order = ?');
        } else {
          fields.push(`${key} = ?`);
        }
        values.push(value);
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    
    await db.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
  
  static async delete(id) {
    // Check if category has children
    const [children] = await db.execute(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    );
    
    if (children[0].count > 0) {
      throw new Error('Cannot delete category with subcategories. Please delete subcategories first.');
    }
    
    // Check if category is used by products
    const [products] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_value_id = ?',
      [id]
    );
    
    if (products[0].count > 0) {
      throw new Error('Cannot delete category that is used by products.');
    }
    
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }
  
  // Removed: updateSortOrder - keeping it simple
}

module.exports = Category;
