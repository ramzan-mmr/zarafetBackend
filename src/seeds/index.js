const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (in reverse order of dependencies)
    await clearExistingData();
    
    // Seed roles
    await seedRoles();
    
    // Seed lookup headers
    await seedLookupHeaders();
    
    // Seed lookup values
    await seedLookupValues();
    
    // Seed admin user
    await seedAdminUser();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

const clearExistingData = async () => {
  console.log('🧹 Clearing existing data...');
  
  const tables = [
    'applied_discounts',
    'order_status_history',
    'shipments',
    'order_items',
    'orders',
    'recently_viewed',
    'wishlists',
    'addresses',
    'customer_profiles',
    'product_variants',
    'product_images',
    'products',
    'lookup_values',
    'lookup_headers',
    'users',
    'roles'
  ];
  
  for (const table of tables) {
    await db.execute(`DELETE FROM ${table}`);
    await db.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
  }
};

const seedRoles = async () => {
  console.log('👥 Seeding roles...');
  
  const roles = [
    { code: 'RL-001', name: 'Admin', description: 'Full system access', level: 1 },
    { code: 'RL-002', name: 'Manager', description: 'Management access', level: 2 },
    { code: 'RL-003', name: 'Staff', description: 'Staff access', level: 3 }
  ];
  
  for (const role of roles) {
    await db.execute(
      'INSERT INTO roles (code, name, description, level) VALUES (?, ?, ?, ?)',
      [role.code, role.name, role.description, role.level]
    );
  }
};

const seedLookupHeaders = async () => {
  console.log('📋 Seeding lookup headers...');
  
  const headers = [
    { code: 'LH-001', name: 'Product Categories', category: 'Product', type: 'System' },
    { code: 'LH-002', name: 'Brands', category: 'Product', type: 'System' },
    { code: 'LH-003', name: 'Product Sizes', category: 'Product', type: 'System' },
    { code: 'LH-004', name: 'Colors', category: 'Product', type: 'System' },
    { code: 'LH-005', name: 'Order Status', category: 'Order', type: 'System' },
    { code: 'LH-006', name: 'Payment Methods', category: 'Payment', type: 'System' },
    { code: 'LH-007', name: 'Cities', category: 'Location', type: 'System' },
    { code: 'LH-008', name: 'Customer Types', category: 'Customer', type: 'System' },
    { code: 'LH-009', name: 'Shipment Methods', category: 'Order', type: 'System' },
    { code: 'LH-010', name: 'Discount Types', category: 'Promotion', type: 'System' }
  ];
  
  for (const header of headers) {
    await db.execute(
      'INSERT INTO lookup_headers (code, name, category, type) VALUES (?, ?, ?, ?)',
      [header.code, header.name, header.category, header.type]
    );
  }
};

const seedLookupValues = async () => {
  console.log('📝 Seeding lookup values...');
  
  // Get header IDs
  const [productCategoriesHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Product Categories"');
  const [brandsHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Brands"');
  const [sizesHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Product Sizes"');
  const [colorsHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Colors"');
  const [orderStatusHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Order Status"');
  const [paymentMethodsHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Payment Methods"');
  const [citiesHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Cities"');
  const [customerTypesHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Customer Types"');
  const [shipmentMethodsHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Shipment Methods"');
  const [discountTypesHeader] = await db.execute('SELECT id FROM lookup_headers WHERE name = "Discount Types"');
  
  const values = [
    // Product Categories
    { header_id: productCategoriesHeader[0].id, value: 'Abayas', order: 1 },
    { header_id: productCategoriesHeader[0].id, value: 'Hijabs', order: 2 },
    { header_id: productCategoriesHeader[0].id, value: 'Jilbabs', order: 3 },
    { header_id: productCategoriesHeader[0].id, value: 'Accessories', order: 4 },
    
    // Brands
    { header_id: brandsHeader[0].id, value: 'Zarafet', order: 1 },
    { header_id: brandsHeader[0].id, value: 'Modest Wear', order: 2 },
    { header_id: brandsHeader[0].id, value: 'Elegant Style', order: 3 },
    
    // Product Sizes
    { header_id: sizesHeader[0].id, value: 'XS', order: 1 },
    { header_id: sizesHeader[0].id, value: 'S', order: 2 },
    { header_id: sizesHeader[0].id, value: 'M', order: 3 },
    { header_id: sizesHeader[0].id, value: 'L', order: 4 },
    { header_id: sizesHeader[0].id, value: 'XL', order: 5 },
    { header_id: sizesHeader[0].id, value: 'XXL', order: 6 },
    
    // Colors
    { header_id: colorsHeader[0].id, value: 'Black', order: 1 },
    { header_id: colorsHeader[0].id, value: 'White', order: 2 },
    { header_id: colorsHeader[0].id, value: 'Navy', order: 3 },
    { header_id: colorsHeader[0].id, value: 'Brown', order: 4 },
    { header_id: colorsHeader[0].id, value: 'Gray', order: 5 },
    { header_id: colorsHeader[0].id, value: 'Beige', order: 6 },
    
    // Order Status
    { header_id: orderStatusHeader[0].id, value: 'Pending', order: 1 },
    { header_id: orderStatusHeader[0].id, value: 'Processing', order: 2 },
    { header_id: orderStatusHeader[0].id, value: 'Shipped', order: 3 },
    { header_id: orderStatusHeader[0].id, value: 'Delivered', order: 4 },
    { header_id: orderStatusHeader[0].id, value: 'Cancelled', order: 5 },
    
    // Payment Methods
    { header_id: paymentMethodsHeader[0].id, value: 'Cash on Delivery', order: 1 },
    { header_id: paymentMethodsHeader[0].id, value: 'Credit Card', order: 2 },
    { header_id: paymentMethodsHeader[0].id, value: 'Bank Transfer', order: 3 },
    { header_id: paymentMethodsHeader[0].id, value: 'PayPal', order: 4 },
    
    // Cities
    { header_id: citiesHeader[0].id, value: 'Karachi', order: 1 },
    { header_id: citiesHeader[0].id, value: 'Lahore', order: 2 },
    { header_id: citiesHeader[0].id, value: 'Islamabad', order: 3 },
    { header_id: citiesHeader[0].id, value: 'Rawalpindi', order: 4 },
    { header_id: citiesHeader[0].id, value: 'Faisalabad', order: 5 },
    
    // Customer Types
    { header_id: customerTypesHeader[0].id, value: 'Regular', order: 1 },
    { header_id: customerTypesHeader[0].id, value: 'VIP', order: 2 },
    { header_id: customerTypesHeader[0].id, value: 'Premium', order: 3 },
    
    // Shipment Methods
    { header_id: shipmentMethodsHeader[0].id, value: 'Standard', order: 1 },
    { header_id: shipmentMethodsHeader[0].id, value: 'Express', order: 2 },
    { header_id: shipmentMethodsHeader[0].id, value: 'Overnight', order: 3 },
    
    // Discount Types
    { header_id: discountTypesHeader[0].id, value: 'Percentage', order: 1 },
    { header_id: discountTypesHeader[0].id, value: 'Fixed Amount', order: 2 },
    { header_id: discountTypesHeader[0].id, value: 'Free Shipping', order: 3 }
  ];
  
  for (const value of values) {
    await db.execute(
      'INSERT INTO lookup_values (header_id, value, `order`) VALUES (?, ?, ?)',
      [value.header_id, value.value, value.order]
    );
  }
};

const seedAdminUser = async () => {
  console.log('👤 Seeding admin user...');
  
  const [adminRole] = await db.execute('SELECT id FROM roles WHERE name = "Admin"');
  const password_hash = await bcrypt.hash('admin123', 12);
  
  await db.execute(
    'INSERT INTO users (code, name, email, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
    ['USR-001', 'Admin User', 'admin@zarafet.com', password_hash, adminRole[0].id, 'Active']
  );
  
  console.log('Admin user created: admin@zarafet.com / admin123');
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
