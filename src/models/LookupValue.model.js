const db = require('../config/db');
const { generateCode } = require('../utils/sql');

class LookupValue {
  static async create(valueData) {
    const { header_id, value, description, status = 'Active', order = 1, parent_value_id, created_by } = valueData;
    
    const [result] = await db.execute(
      `INSERT INTO lookup_values (header_id, value, description, status, \`order\`, parent_value_id, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [header_id, value, description, status, order, parent_value_id, created_by]
    );
    
    // Generate code and update
    const code = generateCode('LV', result.insertId);
    await db.execute(
      'UPDATE lookup_values SET code = ? WHERE id = ?',
      [code, result.insertId]
    );
    
    return this.findById(result.insertId);
  }
  
  static async findAll(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['status'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['value', 'order', 'created_at'], '');
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT * FROM lookup_values
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT lv.*, lh.name as header_name, lh.category as header_category
       FROM lookup_values lv 
       LEFT JOIN lookup_headers lh ON lv.header_id = lh.id
       WHERE lv.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  
  static async findByHeader(header_id, status = 'Active') {
    const [rows] = await db.execute(
      `SELECT * FROM lookup_values 
       WHERE header_id = ? AND status = ? 
       ORDER BY \`order\`, value`,
      [header_id, status]
    );
    return rows;
  }

  static async findByMultipleHeaders(header_ids, status = 'Active') {
    if (!header_ids || header_ids.length === 0) {
      return [];
    }
    
    const placeholders = header_ids.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT lv.*, lh.name as header_name, lh.category as header_category
       FROM lookup_values lv 
       LEFT JOIN lookup_headers lh ON lv.header_id = lh.id
       WHERE lv.header_id IN (${placeholders}) AND lv.status = ? 
       ORDER BY lv.header_id, lv.\`order\`, lv.value`,
      [...header_ids, status]
    );
    return rows;
  }
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    const allowedColumns = ['status'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM lookup_values ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'order') {
          fields.push('`order` = ?');
        } else {
          fields.push(`${key} = ?`);
        }
        values.push(value);
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    
    await db.execute(
      `UPDATE lookup_values SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await db.execute('DELETE FROM lookup_values WHERE id = ?', [id]);
    return true;
  }
}

module.exports = LookupValue;
