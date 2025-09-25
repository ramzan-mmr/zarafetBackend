const db = require('../config/db');
const { generateCode } = require('../utils/sql');

class Order {
  static async create(orderData) {
    const { user_id, items, address_id, shipment, payment_method_value_id, discount_type_value_id, notes } = orderData;
    
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await this.getProductWithVariant(item.product_id, item.variant_id);
        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        
        // Check stock
        const availableStock = item.variant_id ? product.variant_stock : product.stock;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
        
        const unitPrice = product.price + (product.variant_extra_price || 0);
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: unitPrice
        });
      }
      
      const tax = subtotal * 0.1; // 10% tax
      const shipping = 0; // Free shipping for now
      const total = subtotal + tax + shipping;
      
      // Get initial status (assuming "Pending" status exists)
      const [statusRows] = await connection.execute(
        'SELECT id FROM lookup_values WHERE header_id = (SELECT id FROM lookup_headers WHERE name = "Order Status") AND value = "Pending"'
      );
      
      if (!statusRows[0]) {
        throw new Error('Order status "Pending" not found');
      }
      
      const status_value_id = statusRows[0].id;
      
      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, status_value_id, payment_method_value_id, subtotal, tax, shipping, total) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, status_value_id, payment_method_value_id, subtotal, tax, shipping, total]
      );
      
      const orderId = orderResult.insertId;
      
      // Generate order code
      const code = generateCode('ORD', orderId);
      await connection.execute(
        'UPDATE orders SET code = ? WHERE id = ?',
        [code, orderId]
      );
      
      // Create order items and update stock
      for (const item of orderItems) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.variant_id, item.quantity, item.unit_price]
        );
        
        // Update stock
        if (item.variant_id) {
          await connection.execute(
            'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );
        } else {
          await connection.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
      
      // Create shipment if provided
      if (shipment && (shipment.method_value_id || shipment.scheduled_date)) {
        await connection.execute(
          'INSERT INTO shipments (order_id, method_value_id, scheduled_date) VALUES (?, ?, ?)',
          [orderId, shipment.method_value_id, shipment.scheduled_date]
        );
      }
      
      // Create order status history
      await connection.execute(
        'INSERT INTO order_status_history (order_id, to_status_value_id, changed_by) VALUES (?, ?, ?)',
        [orderId, status_value_id, user_id]
      );
      
      // Apply discount if provided
      if (discount_type_value_id) {
        // Calculate discount amount (simplified)
        const discountAmount = subtotal * 0.1; // 10% discount
        await connection.execute(
          'INSERT INTO applied_discounts (order_id, discount_type_value_id, amount) VALUES (?, ?, ?)',
          [orderId, discount_type_value_id, discountAmount]
        );
      }
      
      await connection.commit();
      return this.findById(orderId);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async getProductWithVariant(productId, variantId) {
    if (variantId) {
      const [rows] = await db.execute(
        `SELECT p.*, pv.stock as variant_stock, pv.extra_price as variant_extra_price
         FROM products p 
         JOIN product_variants pv ON p.id = pv.product_id 
         WHERE p.id = ? AND pv.id = ?`,
        [productId, variantId]
      );
      return rows[0] || null;
    } else {
      const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
      return rows[0] || null;
    }
  }
  
  static async findAll(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['status_value_id', 'payment_method_value_id'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['created_at', 'total']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT o.*, 
             u.name as customer_name,
             u.email as customer_email,
             lv1.value as status_name,
             lv2.value as payment_method_name
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN lookup_values lv1 ON o.status_value_id = lv1.id
      LEFT JOIN lookup_values lv2 ON o.payment_method_value_id = lv2.id
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT o.*, 
              u.name as customer_name,
              u.email as customer_email,
              lv1.value as status_name,
              lv2.value as payment_method_name
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN lookup_values lv1 ON o.status_value_id = lv1.id
       LEFT JOIN lookup_values lv2 ON o.payment_method_value_id = lv2.id
       WHERE o.id = ?`,
      [id]
    );
    
    if (!rows[0]) return null;
    
    const order = rows[0];
    
    // Get order items
    const [items] = await db.execute(
      `SELECT oi.*, 
              p.name as product_name,
              p.sku as product_sku,
              pv.sku as variant_sku
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE oi.order_id = ?`,
      [id]
    );
    order.items = items;
    
    // Get shipment info
    const [shipments] = await db.execute(
      `SELECT s.*, lv.value as method_name
       FROM shipments s 
       LEFT JOIN lookup_values lv ON s.method_value_id = lv.id
       WHERE s.order_id = ?`,
      [id]
    );
    order.shipment = shipments[0] || null;
    
    return order;
  }
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    const allowedColumns = ['status_value_id', 'payment_method_value_id'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  static async updateStatus(id, to_status_value_id, changed_by) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get current status
      const [currentRows] = await connection.execute(
        'SELECT status_value_id FROM orders WHERE id = ?',
        [id]
      );
      
      if (!currentRows[0]) {
        throw new Error('Order not found');
      }
      
      const from_status_value_id = currentRows[0].status_value_id;
      
      // Update order status
      await connection.execute(
        'UPDATE orders SET status_value_id = ? WHERE id = ?',
        [to_status_value_id, id]
      );
      
      // Add to history
      await connection.execute(
        'INSERT INTO order_status_history (order_id, from_status_value_id, to_status_value_id, changed_by) VALUES (?, ?, ?, ?)',
        [id, from_status_value_id, to_status_value_id, changed_by]
      );
      
      await connection.commit();
      return this.findById(id);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async getHistory(id) {
    const [rows] = await db.execute(
      `SELECT osh.*, 
              u.name as changed_by_name,
              lv1.value as from_status_name,
              lv2.value as to_status_name
       FROM order_status_history osh 
       LEFT JOIN users u ON osh.changed_by = u.id
       LEFT JOIN lookup_values lv1 ON osh.from_status_value_id = lv1.id
       LEFT JOIN lookup_values lv2 ON osh.to_status_value_id = lv2.id
       WHERE osh.order_id = ? 
       ORDER BY osh.changed_at DESC`,
      [id]
    );
    return rows;
  }
}

module.exports = Order;
