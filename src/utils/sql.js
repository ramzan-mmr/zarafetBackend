/**
 * SQL query building helpers
 */

const buildWhereClause = (filters, allowedColumns = []) => {
  const conditions = [];
  const values = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (allowedColumns.length === 0 || allowedColumns.includes(key)) {
        if (key.includes('_id') || key === 'id') {
          conditions.push(`${key} = ?`);
          values.push(value);
        } else if (key === 'search') {
          // Handle search across multiple columns
          conditions.push(`(name LIKE ? OR description LIKE ? OR sku LIKE ?)`);
          const searchTerm = `%${value}%`;
          values.push(searchTerm, searchTerm, searchTerm);
        } else if (key === 'from') {
          conditions.push(`created_at >= ?`);
          values.push(value);
        } else if (key === 'to') {
          conditions.push(`created_at <= ?`);
          values.push(value);
        } else if (key === 'minPrice') {
          conditions.push(`price >= ?`);
          values.push(value);
        } else if (key === 'maxPrice') {
          conditions.push(`price <= ?`);
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
          conditions.push(`${key} = ?`);
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

const buildOrderClause = (sortBy, sortDir = 'asc', allowedColumns = []) => {
  if (!sortBy || (allowedColumns.length > 0 && !allowedColumns.includes(sortBy))) {
    return 'ORDER BY created_at DESC';
  }
  
  const direction = sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${sortBy} ${direction}`;
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
