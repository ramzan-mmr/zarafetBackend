const db = require('./src/config/db.js');

async function checkConstraints() {
  try {
    console.log('🔍 Checking foreign key constraints...');
    
    // Check if product 21 has order items
    const [orderItems] = await db.execute('SELECT COUNT(*) as count FROM order_items WHERE product_id = 21');
    console.log('Order items for product 21:', orderItems[0]);
    
    // Check foreign key constraints
    const [constraints] = await db.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        DELETE_RULE
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'products' 
      AND TABLE_SCHEMA = 'zarafet_db'
    `);
    console.log('Foreign key constraints referencing products:', constraints);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkConstraints();
