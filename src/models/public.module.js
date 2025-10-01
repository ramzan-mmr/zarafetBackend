const db = require('../config/db');

class PublicModule {
  // Get lookup values by header IDs
  static async getLookupValues(headerIds) {
    const placeholders = headerIds.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT lv.*, lh.name as header_name, lh.code as header_code
       FROM lookup_values lv
       LEFT JOIN lookup_headers lh ON lv.header_id = lh.id
       WHERE lv.header_id IN (${placeholders}) AND lv.status = 'Active'
       ORDER BY lv.header_id, lv.\`order\`, lv.id`,
      headerIds
    );
    return rows;
  }

  // Get trending products
  static async getTrendingProducts(limit = 8) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             lv.value as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN lookup_values lv ON p.category_value_id = lv.id
      WHERE p.status = 'Active' 
        AND p.stock_status != 'Out of Stock'
        AND p.discount_percentage IS NOT NULL
        AND p.discount_percentage > 0
      ORDER BY p.discount_percentage DESC, p.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    return await this.enrichProductsWithDetails(rows);
  }

  // Get latest arrival products
  static async getLatestProducts(limit = 8) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             lv.value as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN lookup_values lv ON p.category_value_id = lv.id
      WHERE p.status = 'Active'
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    return await this.enrichProductsWithDetails(rows);
  }

  // Get featured products
  static async getFeaturedProducts(limit = 8) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             lv.value as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN lookup_values lv ON p.category_value_id = lv.id
      WHERE p.status = 'Active' 
        AND p.stock_status != 'Out of Stock'
        AND (
          p.discount_percentage > 20 
          OR p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        )
      ORDER BY p.discount_percentage DESC, p.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    return await this.enrichProductsWithDetails(rows);
  }

  // Get products with filters
  static async getProducts(filters = {}, pagination = {}) {
    const { buildWhereClause, buildOrderClause, buildPaginationClause } = require('../utils/sql');
    
    // Handle multiple categories separately
    let whereClause = '';
    let values = [];
    
    if (filters.categories && filters.categories.length > 0) {
      // Handle multiple categories
      const categoryPlaceholders = filters.categories.map(() => '?').join(',');
      whereClause = `WHERE p.category_value_id IN (${categoryPlaceholders})`;
      values = [...filters.categories];
      
      // Remove categories from filters to avoid double processing
      const { categories, ...otherFilters } = filters;
      const { whereClause: otherWhereClause, values: otherValues } = buildWhereClause(otherFilters, ['status', 'stock_status', 'search', 'minPrice', 'maxPrice']);
      
      if (otherWhereClause) {
        whereClause += ` AND ${otherWhereClause.replace('WHERE ', '')}`;
        values.push(...otherValues);
      }
    } else {
      // Use normal filter processing
      const allowedColumns = ['category_value_id', 'status', 'stock_status', 'search', 'minPrice', 'maxPrice'];
      const result = buildWhereClause(filters, allowedColumns);
      whereClause = result.whereClause;
      values = result.values;
    }
    
    // Handle type filtering
    if (filters.type) {
      const typeCondition = this.getTypeCondition(filters.type);
      if (typeCondition) {
        if (whereClause) {
          whereClause += ` AND ${typeCondition}`;
        } else {
          whereClause = `WHERE ${typeCondition}`;
        }
      }
    }
    
    const orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'price', 'stock', 'date_added', 'created_at', 'total_orders']);
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    const query = `
      SELECT p.*, 
             lv1.value as category_name
      FROM products p 
      LEFT JOIN lookup_values lv1 ON p.category_value_id = lv1.id
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    return await this.enrichProductsWithDetails(rows);
  }

  // Count products with filters
  static async countProducts(filters = {}) {
    const { buildWhereClause } = require('../utils/sql');
    
    // Handle multiple categories separately
    let whereClause = '';
    let values = [];
    
    if (filters.categories && filters.categories.length > 0) {
      // Handle multiple categories
      const categoryPlaceholders = filters.categories.map(() => '?').join(',');
      whereClause = `WHERE p.category_value_id IN (${categoryPlaceholders})`;
      values = [...filters.categories];
      
      // Remove categories from filters to avoid double processing
      const { categories, ...otherFilters } = filters;
      const { whereClause: otherWhereClause, values: otherValues } = buildWhereClause(otherFilters, ['status', 'stock_status', 'search', 'minPrice', 'maxPrice']);
      
      if (otherWhereClause) {
        whereClause += ` AND ${otherWhereClause.replace('WHERE ', '')}`;
        values.push(...otherValues);
      }
    } else {
      // Use normal filter processing
      const allowedColumns = ['category_value_id', 'status', 'stock_status', 'search', 'minPrice', 'maxPrice'];
      const result = buildWhereClause(filters, allowedColumns);
      whereClause = result.whereClause;
      values = result.values;
    }
    
    // Handle type filtering
    if (filters.type) {
      const typeCondition = this.getTypeCondition(filters.type);
      if (typeCondition) {
        if (whereClause) {
          whereClause += ` AND ${typeCondition}`;
        } else {
          whereClause = `WHERE ${typeCondition}`;
        }
      }
    }
    
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      values
    );
    return rows[0].total;
  }

  // Helper method to enrich products with images and variants
  static async enrichProductsWithDetails(products) {
    return await Promise.all(
      products.map(async (product) => {
        // Get product images
        const [images] = await db.execute(
          'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY `order`',
          [product.id]
        );
        
        // Get product variants
        const [variants] = await db.execute(
          'SELECT * FROM product_variants WHERE product_id = ?',
          [product.id]
        );

        return {
          ...product,
          images: images.map(img => img.image_url),
          variants,
          main_image: images.length > 0 ? images[0].image_url : null
        };
      })
    );
  }

  // Helper method to get type condition for filtering
  static getTypeCondition(type) {
    switch (type) {
      case 'trending':
        return `p.discount_percentage IS NOT NULL AND p.discount_percentage > 0 AND p.stock_status != 'Out of Stock'`;
      case 'latest':
        return `p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      case 'featured':
        return `(p.discount_percentage > 20 OR p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AND p.stock_status != 'Out of Stock'`;
      default:
        return null;
    }
  }

  // Get products by type with size and color filtering
  static async getProductsByTypeWithFilters(type, filters = {}) {
    const { size, color } = filters;
    
    // Get base products by type
    let products;
    switch (type) {
      case 'trending':
        products = await this.getTrendingProducts(filters.limit || 8);
        break;
      case 'latest':
        products = await this.getLatestProducts(filters.limit || 8);
        break;
      case 'featured':
        products = await this.getFeaturedProducts(filters.limit || 8);
        break;
      default:
        products = await this.getProducts(filters, { page: 1, limit: filters.limit || 8 });
    }

    // Apply size filter if provided
    if (size) {
      const sizes = size.includes(',') ? size.split(',').map(s => s.trim()) : [size];
      products = products.filter(product => 
        product.variants.some(variant => sizes.includes(variant.size))
      );
    }

    // Apply color filter if provided
    if (color) {
      products = products.filter(product => 
        product.variants.some(variant => 
          variant.color_name?.toLowerCase().includes(color.toLowerCase()) ||
          variant.color_code?.toLowerCase().includes(color.toLowerCase())
        )
      );
    }

    return products;
  }

  // Get single product by ID
  static async getProductById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             lv.value as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN lookup_values lv ON p.category_value_id = lv.id
      WHERE p.id = ? AND p.status = 'Active'
    `, [id]);

    if (rows.length === 0) {
      return null;
    }

    const product = rows[0];
    
    // Get all product images
    const [images] = await db.execute(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY `order`',
      [product.id]
    );
    
    // Get all product variants
    const [variants] = await db.execute(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [product.id]
    );

    return {
      ...product,
      images: images.map(img => img.image_url),
      variants,
      main_image: images.length > 0 ? images[0].image_url : null
    };
  }
}

module.exports = PublicModule;
