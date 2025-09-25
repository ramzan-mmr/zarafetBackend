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
    
    // Get previous period data for deltas
    const [prevRevenueRows] = await db.execute(
      'SELECT COALESCE(SUM(total), 0) as prev_revenue FROM orders WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    const prev_revenue = prevRevenueRows[0].prev_revenue;
    
    const [prevOrdersRows] = await db.execute(
      'SELECT COUNT(*) as prev_orders FROM orders WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    const prev_orders = prevOrdersRows[0].prev_orders;
    
    const [prevCustomersRows] = await db.execute(
      `SELECT COUNT(*) as prev_customers 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE r.name = 'Customer' AND u.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    const prev_customers = prevCustomersRows[0].prev_customers;
    
    // Calculate deltas
    const delta_revenue_pct = prev_revenue > 0 ? ((total_revenue - prev_revenue) / prev_revenue) * 100 : 0;
    const delta_orders_pct = prev_orders > 0 ? ((total_orders - prev_orders) / prev_orders) * 100 : 0;
    const delta_customers_pct = prev_customers > 0 ? ((total_customers - prev_customers) / prev_customers) * 100 : 0;
    
    res.json(responses.ok({
      total_revenue,
      total_orders,
      total_customers,
      products_sold,
      delta_orders_pct: Math.round(delta_orders_pct * 100) / 100,
      delta_revenue_pct: Math.round(delta_revenue_pct * 100) / 100,
      delta_customers_pct: Math.round(delta_customers_pct * 100) / 100
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
         lv.value as category_name,
         COUNT(DISTINCT o.id) as orders,
         COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN lookup_values lv ON p.category_value_id = lv.id
       WHERE 1=1 ${whereClause}
       GROUP BY p.category_value_id, lv.value
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
