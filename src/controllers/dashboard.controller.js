const db = require('../config/db');
const responses = require('../utils/responses');

const getMetrics = async (req, res) => {
  try {
    // Get total revenue
    const [revenueRows] = await db.execute(
      'SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders'
    );
    const total_revenue = revenueRows[0].total_revenue;
    
    // Get total orders
    const [ordersRows] = await db.execute(
      'SELECT COUNT(*) as total_orders FROM orders'
    );
    const total_orders = ordersRows[0].total_orders;
    
    // Get total customers
    const [customersRows] = await db.execute(
      `SELECT COUNT(*) as total_customers 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE r.name = 'Customer'`
    );
    const total_customers = customersRows[0].total_customers;
    
    // Get products sold
    const [productsRows] = await db.execute(
      'SELECT COALESCE(SUM(quantity), 0) as products_sold FROM order_items'
    );
    const products_sold = productsRows[0].products_sold;
    
    
    res.json(responses.ok({
      total_revenue,
      total_orders,
      total_customers,
      products_sold
    }));
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json(responses.internalError('Failed to fetch dashboard metrics'));
  }
};

const getSalesPerformance = async (req, res) => {
  try {
    const { from, to, interval = 'month' } = req.query;
    
    let dateFormat, groupBy;
    if (interval === 'day') {
      dateFormat = '%Y-%m-%d';
      groupBy = 'DATE(created_at)';
    } else {
      dateFormat = '%Y-%m';
      groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
    }
    
    let whereClause = '';
    const values = [];
    
    if (from) {
      whereClause += ' AND created_at >= ?';
      values.push(from);
    }
    if (to) {
      whereClause += ' AND created_at <= ?';
      values.push(to);
    }
    
    const [rows] = await db.execute(
      `SELECT 
         ${groupBy} as period,
         COUNT(*) as orders,
         COALESCE(SUM(total), 0) as revenue
       FROM orders 
       WHERE 1=1 ${whereClause}
       GROUP BY ${groupBy}
       ORDER BY period`
    );
    
    const orders = rows.map(row => ({ period: row.period, value: row.orders }));
    const revenue = rows.map(row => ({ period: row.period, value: row.revenue }));
    
    res.json(responses.ok({
      orders,
      revenue
    }));
  } catch (error) {
    console.error('Get sales performance error:', error);
    res.status(500).json(responses.internalError('Failed to fetch sales performance'));
  }
};

const getSalesByCategory = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    let whereClause = '';
    const values = [];
    
    if (from) {
      whereClause += ' AND o.created_at >= ?';
      values.push(from);
    }
    if (to) {
      whereClause += ' AND o.created_at <= ?';
      values.push(to);
    }
    
    const [rows] = await db.execute(
      `SELECT 
         c.name as category_name,
         COUNT(DISTINCT o.id) as orders,
         COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.category_value_id = c.id
       WHERE 1=1 ${whereClause}
       GROUP BY p.category_value_id, c.name
       ORDER BY revenue DESC`
    );
    
    res.json(responses.ok(rows));
  } catch (error) {
    console.error('Get sales by category error:', error);
    res.status(500).json(responses.internalError('Failed to fetch sales by category'));
  }
};

module.exports = {
  getMetrics,
  getSalesPerformance,
  getSalesByCategory
};
