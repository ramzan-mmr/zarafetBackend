const db = require('../config/db');
const { generateCode } = require('../utils/sql');

class Product {
  static async create(productData) {
    const { sku, name, description, category_value_id, brand_value_id, price, stock, stock_status, status, images, variants } = productData;
    
    const [result] = await db.execute(
      `INSERT INTO products (sku, name, description, category_value_id, brand_value_id, price, stock, stock_status, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, description, category_value_id, brand_value_id, price, stock, stock_status, status]
    );
    
    const productId = result.insertId;
    
    // Generate code and update
    const code = generateCode('PRD', productId);
    await db.execute(
      'UPDATE products SET code = ? WHERE id = ?',
      [code, productId]
    );
    
    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.execute(
          'INSERT INTO product_images (product_id, image_url, `order`) VALUES (?, ?, ?)',
          [productId, images[i], i + 1]
        );
      }
    }
    
    // Insert variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await db.execute(
          `INSERT INTO product_variants (product_id, size_value_id, color_value_id, sku, extra_price, stock) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, variant.size_value_id, variant.color_value_id, variant.sku, variant.extra_price, variant.stock]
        );
      }
    }
    
    return this.findById(productId);
  }
  
  static async findAll(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    const allowedColumns = ['category_value_id', 'brand_value_id', 'status', 'stock_status'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'price', 'stock', 'date_added', 'created_at']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT p.*, 
             lv1.value as category_name,
             lv2.value as brand_name
      FROM products p 
      LEFT JOIN lookup_values lv1 ON p.category_value_id = lv1.id
      LEFT JOIN lookup_values lv2 ON p.brand_value_id = lv2.id
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT p.*, 
              lv1.value as category_name,
              lv2.value as brand_name
       FROM products p 
       LEFT JOIN lookup_values lv1 ON p.category_value_id = lv1.id
       LEFT JOIN lookup_values lv2 ON p.brand_value_id = lv2.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (!rows[0]) return null;
    
    const product = rows[0];
    
    // Get images
    const [images] = await db.execute(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY `order`',
      [id]
    );
    product.images = images.map(img => img.image_url);
    
    // Get variants
    const [variants] = await db.execute(
      `SELECT pv.*, 
              lv1.value as size_name,
              lv2.value as color_name
       FROM product_variants pv 
       LEFT JOIN lookup_values lv1 ON pv.size_value_id = lv1.id
       LEFT JOIN lookup_values lv2 ON pv.color_value_id = lv2.id
       WHERE pv.product_id = ?`,
      [id]
    );
    product.variants = variants;
    
    return product;
  }
  
  static async count(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    const allowedColumns = ['category_value_id', 'brand_value_id', 'status', 'stock_status'];
    const { whereClause, values } = buildWhereClause(filters, allowedColumns);
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      values
    );
    return rows[0].total;
  }
  
  static async update(id, updateData) {
    const { images, variants, ...productData } = updateData;
    
    const fields = [];
    const values = [];
    
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length > 0) {
      values.push(id);
      await db.execute(
        `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }
    
    // Update images if provided
    if (images !== undefined) {
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await db.execute(
            'INSERT INTO product_images (product_id, image_url, `order`) VALUES (?, ?, ?)',
            [id, images[i], i + 1]
          );
        }
      }
    }
    
    // Update variants if provided
    if (variants !== undefined) {
      await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      if (variants.length > 0) {
        for (const variant of variants) {
          await db.execute(
            `INSERT INTO product_variants (product_id, size_value_id, color_value_id, sku, extra_price, stock) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, variant.size_value_id, variant.color_value_id, variant.sku, variant.extra_price, variant.stock]
          );
        }
      }
    }
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }
  
  static async updateStock(id, quantity) {
    await db.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, id]
    );
  }
  
  static async updateVariantStock(variantId, quantity) {
    await db.execute(
      'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
      [quantity, variantId]
    );
  }
}

module.exports = Product;
