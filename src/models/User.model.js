const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateCode } = require('../utils/sql');

class User {
  static async create(userData) {
    const { name, email, password, role_id, status = 'Active', phone, user_type = 'admin' } = userData;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 12);
    
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password_hash, role_id, status, phone, user_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, role_id, status, phone, user_type]
    );
    
    // Generate code and update
    const code = generateCode('USR', result.insertId);
    await db.execute(
      'UPDATE users SET code = ? WHERE id = ?',
      [code, result.insertId]
    );
    
    return this.findById(result.insertId);
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT u.*, r.name as role_name, r.level as role_level 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  
  static async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT u.*, r.name as role_name, r.level as role_level 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  /** Returns a user if this email is already registered (non-guest). Used to block guest checkout for existing accounts. */
  static async findRegisteredUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const [rows] = await db.execute(
      `SELECT id, email, name, is_guest FROM users WHERE LOWER(TRIM(email)) = LOWER(?) AND (is_guest = 0 OR is_guest IS NULL)`,
      [email.trim()]
    );
    return rows[0] || null;
  }
  
  static async findAll(filters = {}, pagination = {}) {
    const { buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    // Build custom where clause for user-specific columns
    const conditions = [];
    const values = [];
    
    // Handle status filter
    if (filters.status) {
      conditions.push('u.status = ?');
      values.push(filters.status);
    }
    
    // Handle role filter
    if (filters.role_id) {
      conditions.push('u.role_id = ?');
      values.push(filters.role_id);
    }
    // Handle role names filter (e.g., ['Admin','Manager'])
    if (filters.role_names && Array.isArray(filters.role_names) && filters.role_names.length > 0) {
      const placeholders = filters.role_names.map(() => '?').join(',');
      conditions.push(`r.name IN (${placeholders})`);
      values.push(...filters.role_names);
    }
    // Handle user_type filter (admin/customer)
    if (filters.user_type) {
      conditions.push('u.user_type = ?');
      values.push(filters.user_type);
    }
    
    // Handle search filter
    if (filters.search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'created_at', 'updated_at', 'last_login_at']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async count(filters = {}) {
    // Build custom where clause for user-specific columns
    const conditions = [];
    const values = [];
    
    // Handle status filter
    if (filters.status) {
      conditions.push('u.status = ?');
      values.push(filters.status);
    }
    
    // Handle role filter
    if (filters.role_id) {
      conditions.push('u.role_id = ?');
      values.push(filters.role_id);
    }
    // Handle role names filter (e.g., ['Admin','Manager'])
    if (filters.role_names && Array.isArray(filters.role_names) && filters.role_names.length > 0) {
      const placeholders = filters.role_names.map(() => '?').join(',');
      conditions.push(`r.name IN (${placeholders})`);
      values.push(...filters.role_names);
    }
    // Handle user_type filter (admin/customer)
    if (filters.user_type) {
      conditions.push('u.user_type = ?');
      values.push(filters.user_type);
    }
    
    // Handle search filter
    if (filters.search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM users u LEFT JOIN roles r ON u.role_id = r.id ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'password') {
          fields.push('password_hash = ?');
          values.push(bcrypt.hashSync(value, 12));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    
    await db.execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
  
  static async updateLastLogin(id) {
    await db.execute(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }
  
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 12);
    await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [password_hash, id]
    );
    return true;
  }

  static async findOrCreateGuest({ name, email, phone }) {
    const [existing] = await db.execute(
      `SELECT u.*, r.name as role_name, r.level as role_level
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.is_guest = 1`,
      [email]
    );

    if (existing.length > 0) {
      const guest = existing[0];
      // Do not update name/phone so that previous orders still show the correct customer name
      return this.findById(guest.id);
    }

    const [roleRows] = await db.execute(
      "SELECT id FROM roles WHERE name = 'Customer'"
    );
    const customerRoleId = roleRows.length > 0 ? roleRows[0].id : 3;

    const randomPassword = crypto.randomBytes(32).toString('hex');
    const password_hash = await bcrypt.hash(randomPassword, 12);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password_hash, role_id, status, phone, user_type, is_guest)
       VALUES (?, ?, ?, ?, 'Active', ?, 'customer', 1)`,
      [name, email, password_hash, customerRoleId, phone]
    );

    const code = generateCode('USR', result.insertId);
    await db.execute(
      'UPDATE users SET code = ? WHERE id = ?',
      [code, result.insertId]
    );

    return this.findById(result.insertId);
  }
}

module.exports = User;
