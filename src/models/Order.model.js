const db = require('../config/db');
const { generateCode } = require('../utils/sql');

class Order {
  static async create(orderData) {
    console.log('🏗️ Order.create() called with data:', {
      user_id: orderData.user_id,
      items_count: orderData.items?.length,
      address_id: orderData.address_id,
      payment_id: orderData.payment_id,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping: orderData.shipping,
      total: orderData.total
    });
    
    const { user_id, items, address_id, shipment, payment_method_value_id, discount_type_value_id, notes, payment_id, address_snapshot } = orderData;
    
    // Start transaction
    console.log('🔄 Starting database transaction...');
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      console.log('📊 Processing order items...');
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];
      
      for (const item of items) {
        console.log(`📋 Processing order item: Product ID ${item.product_id}, Variant ID ${item.variant_id}`);
        
        const product = await this.getProductWithVariant(item.product_id, item.variant_id);
        if (!product) {
          console.error(`❌ Product not found: ${item.product_id}`);
          throw new Error(`Product not found: ${item.product_id}`);
        }
        
        console.log(`✅ Product found: ${product.name}`);
        
        // Check stock
        const availableStock = item.variant_id ? product.variant_stock : product.stock;
        console.log(`📊 Stock check: Required=${item.quantity}, Available=${availableStock}`);
        
        if (availableStock < item.quantity) {
          console.error(`❌ Insufficient stock for ${product.name}`);
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
        
        const unitPrice = product.price + (product.variant_extra_price || 0);
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;
        
        console.log(`💰 Item pricing: Unit=${unitPrice}, Quantity=${item.quantity}, Total=${itemTotal}`);
        
        orderItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: unitPrice
        });
      }
      
      console.log(`📊 Order subtotal calculated: ${subtotal}`);
      
      // Use provided totals instead of calculating
      const tax = orderData.tax || (subtotal * 0.1); // Use provided tax or calculate
      const shipping = orderData.shipping || 0; // Use provided shipping or 0
      const total = orderData.total || (subtotal + tax + shipping); // Use provided total or calculate
      
      console.log(`📊 Final order totals: Subtotal=${subtotal}, Tax=${tax}, Shipping=${shipping}, Total=${total}`);
      
      // Get initial status (assuming "Pending" status exists)
      console.log('🔍 Looking up order status...');
      const [statusRows] = await connection.execute(
        'SELECT id FROM lookup_values WHERE header_id = (SELECT id FROM lookup_headers WHERE name = "Order Status") AND value = "Pending"'
      );
      
      if (!statusRows[0]) {
        console.error('❌ Order status "Pending" not found');
        throw new Error('Order status "Pending" not found');
      }
      
      const status_value_id = statusRows[0].id;
      console.log(`✅ Order status found: ${status_value_id}`);
      
      // Create order
      console.log('💾 Creating order record in database...');
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, status_value_id, payment_method_value_id, subtotal, tax, shipping, total, payment_id, payment_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, status_value_id, payment_method_value_id, subtotal, tax, shipping, total, payment_id, payment_id ? 'paid' : 'pending']
      );
      
      const orderId = orderResult.insertId;
      console.log(`✅ Order record created with ID: ${orderId}`);
      
      // Generate order code
      console.log('🔢 Generating order code...');
      const code = generateCode('ORD', orderId);
      await connection.execute(
        'UPDATE orders SET code = ? WHERE id = ?',
        [code, orderId]
      );
      console.log(`✅ Order code generated: ${code}`);
      
      // Create order items and update stock
      console.log('📦 Creating order items and updating stock...');
      for (const item of orderItems) {
        console.log(`📋 Creating order item: Product ${item.product_id}, Variant ${item.variant_id}, Qty ${item.quantity}`);
        
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.variant_id, item.quantity, item.unit_price]
        );
        
        // Update stock
        if (item.variant_id) {
          console.log(`📊 Updating variant stock: ${item.variant_id}, -${item.quantity}`);
          await connection.execute(
            'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );
        } else {
          console.log(`📊 Updating product stock: ${item.product_id}, -${item.quantity}`);
          await connection.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
      
      // Create shipment if provided
      if (shipment && (shipment.method_value_id || shipment.scheduled_date)) {
        console.log('🚚 Creating shipment record...');
        await connection.execute(
          'INSERT INTO shipments (order_id, method_value_id, scheduled_date) VALUES (?, ?, ?)',
          [orderId, shipment.method_value_id, shipment.scheduled_date]
        );
        console.log('✅ Shipment record created');
      }
      
      // Create order address snapshot if provided
      if (address_snapshot) {
        console.log('🏠 Creating order address snapshot...');
        await connection.execute(
          'INSERT INTO order_addresses (order_id, label, line1, line2, city, postal_code, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, address_snapshot.label, address_snapshot.line1, address_snapshot.line2, address_snapshot.city, address_snapshot.postal_code, address_snapshot.phone]
        );
        console.log('✅ Order address snapshot created');
      }
      
      // Create order status history
      console.log('📝 Creating order status history...');
      await connection.execute(
        'INSERT INTO order_status_history (order_id, to_status_value_id, changed_by) VALUES (?, ?, ?)',
        [orderId, status_value_id, user_id]
      );
      console.log('✅ Order status history created');
      
      // Apply discount if provided
      if (discount_type_value_id) {
        console.log('💰 Applying discount...');
        // Calculate discount amount (simplified)
        const discountAmount = subtotal * 0.1; // 10% discount
        await connection.execute(
          'INSERT INTO applied_discounts (order_id, discount_type_value_id, amount) VALUES (?, ?, ?)',
          [orderId, discount_type_value_id, discountAmount]
        );
        console.log('✅ Discount applied');
      }
      
      console.log('✅ Committing transaction...');
      await connection.commit();
      console.log('🎉 Order creation completed successfully!');
      
      return this.findById(orderId);
      
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      console.error('❌ Rolling back transaction...');
      await connection.rollback();
      throw error;
    } finally {
      console.log('🔄 Releasing database connection...');
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
             lv2.value as payment_method_name,
             p.stripe_payment_intent_id,
             p.status as payment_status
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN lookup_values lv1 ON o.status_value_id = lv1.id
      LEFT JOIN lookup_values lv2 ON o.payment_method_value_id = lv2.id
      LEFT JOIN payments p ON o.payment_id = p.id
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
              lv2.value as payment_method_name,
              p.stripe_payment_intent_id,
              p.status as payment_status
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN lookup_values lv1 ON o.status_value_id = lv1.id
       LEFT JOIN lookup_values lv2 ON o.payment_method_value_id = lv2.id
       LEFT JOIN payments p ON o.payment_id = p.id
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

    // Get order address snapshot
    const [addresses] = await db.execute(
      'SELECT * FROM order_addresses WHERE order_id = ?',
      [id]
    );
    order.order_address = addresses[0] || null;
    
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
