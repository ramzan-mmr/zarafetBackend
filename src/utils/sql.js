/**
 * SQL query building helpers
 */

const buildWhereClause = (filters, allowedColumns = [], tableAlias = 'p') => {
  const conditions = [];
  const values = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (allowedColumns.length === 0 || allowedColumns.includes(key)) {
        if (key.includes('_id') || key === 'id') {
          conditions.push(`${tableAlias}.${key} = ?`);
          values.push(value);
        } else if (key === 'search') {
          // Handle search across multiple columns
          conditions.push(`(${tableAlias}.name LIKE ? OR ${tableAlias}.description LIKE ? OR ${tableAlias}.sku LIKE ?)`);
          const searchTerm = `%${value}%`;
          values.push(searchTerm, searchTerm, searchTerm);
        } else if (key === 'from') {
          conditions.push(`created_at >= ?`);
          values.push(value);
        } else if (key === 'to') {
          conditions.push(`created_at <= ?`);
          values.push(value);
        } else if (key === 'minPrice') {
          conditions.push(`${tableAlias}.price >= ?`);
          values.push(value);
        } else if (key === 'maxPrice') {
          conditions.push(`${tableAlias}.price <= ?`);
          values.push(value);
        } else if (key === 'minOrders') {
          conditions.push(`total_orders >= ?`);
          values.push(value);
        } else if (key === 'maxOrders') {
          conditions.push(`total_orders <= ?`);
          values.push(value);
        } else if (key === 'minSpend') {
          conditions.push(`total_spend >= ?`);
          values.push(value);
        } else if (key === 'maxSpend') {
          conditions.push(`total_spend <= ?`);
          values.push(value);
        } else {
          // Use table alias for columns
          if (key === 'status' || key === 'stock_status') {
            conditions.push(`${tableAlias}.${key} = ?`);
          } else if (key === 'category_value_id') {
            conditions.push(`${tableAlias}.${key} = ?`);
          } else {
            conditions.push(`${tableAlias}.${key} = ?`);
          }
          values.push(value);
        }
      }
    }
  }
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
};

const buildOrderClause = (sortBy, sortDir = 'asc', allowedColumns = [], tableAlias = 'p') => {
  const direction = sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const prefix = tableAlias ? `${tableAlias}.` : '';
  
  if (!sortBy) {
    return `ORDER BY ${prefix}created_at DESC`;
  }
  
  // Handle special sorting expressions (like COALESCE, CASE, etc.)
  // Skip allowedColumns validation for expressions
  if (sortBy.includes('(') || sortBy.includes('COALESCE') || sortBy.includes('CASE')) {
    return `ORDER BY ${sortBy} ${direction}`;
  }
  
  // Validate against allowedColumns only if it's a simple column name
  if (allowedColumns.length > 0 && !allowedColumns.includes(sortBy)) {
    return `ORDER BY ${prefix}created_at DESC`;
  }
  
  return `ORDER BY ${prefix}${sortBy} ${direction}`;
};

const buildPaginationClause = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return `LIMIT ${limit} OFFSET ${offset}`;
};

const buildCountQuery = (baseQuery, whereClause, values) => {
  return {
    query: `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`,
    values
  };
};

const generateCode = (prefix, id) => {
  return `${prefix}-${String(id).padStart(5, '0')}`;
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

const formatDateTime = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
};

module.exports = {
  buildWhereClause,
  buildOrderClause,
  buildPaginationClause,
  buildCountQuery,
  generateCode,
  formatDate,
  formatDateTime
};
