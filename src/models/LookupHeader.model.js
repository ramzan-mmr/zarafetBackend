const db = require('../config/db');
const { generateCode } = require('../utils/sql');

class LookupHeader {
  static async create(headerData) {
    const { name, description, category, type = 'Custom', status = 'Active' } = headerData;
    
    const [result] = await db.execute(
      `INSERT INTO lookup_headers (name, description, category, type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, category, type, status]
    );
    
    // Generate code and update
    const code = generateCode('LH', result.insertId);
    await db.execute(
      'UPDATE lookup_headers SET code = ? WHERE id = ?',
      [code, result.insertId]
    );
    
    return this.findById(result.insertId);
  }
  
  static async findAll(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['category', 'status', 'type'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'created_at']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT * FROM lookup_headers 
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM lookup_headers WHERE id = ?', [id]);
    return rows[0] || null;
  }
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    const allowedColumns = ['category', 'status', 'type'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM lookup_headers ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  static async update(id, updateData) {
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
      `UPDATE lookup_headers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await db.execute('DELETE FROM lookup_headers WHERE id = ?', [id]);
    return true;
  }
}

module.exports = LookupHeader;
