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
    // Get products with discounts first (trending), then fill with recent products
    const [rows] = await db.execute(`
      SELECT p.*, 
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_value_id = c.id
      WHERE p.status = 'Active' 
        AND p.stock_status != 'Out of Stock'
      ORDER BY 
        CASE 
          WHEN p.discount_percentage IS NOT NULL AND p.discount_percentage > 0 THEN 0
          ELSE 1
        END,
        p.discount_percentage DESC,
        p.updated_at DESC,
        p.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    return await this.enrichProductsWithDetails(rows);
  }

  // Get latest arrival products
  static async getLatestProducts(limit = 8) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_value_id = c.id
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
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_value_id = c.id
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
    
    // Handle size filtering at database level
    if (filters.size) {
      const sizes = filters.size.includes(',') ? filters.size.split(',').map(s => s.trim()) : [filters.size];
      const sizePlaceholders = sizes.map(() => '?').join(',');
      const sizeCondition = `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size IN (${sizePlaceholders}))`;
      
      if (whereClause) {
        whereClause += ` AND ${sizeCondition}`;
      } else {
        whereClause = `WHERE ${sizeCondition}`;
      }
      values.push(...sizes);
    }
    
    // Handle color filtering at database level
    if (filters.color) {
      const colors = filters.color.includes(',') ? filters.color.split(',').map(c => c.trim()) : [filters.color];
      const colorPlaceholders = colors.map(() => '?').join(',');
      const colorCondition = `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.color_name IN (${colorPlaceholders}))`;
      
      if (whereClause) {
        whereClause += ` AND ${colorCondition}`;
      } else {
        whereClause = `WHERE ${colorCondition}`;
      }
      values.push(...colors);
    }
    
    // Always filter for Active products in public endpoints (unless explicitly overridden)
    if (!filters.status) {
      if (whereClause) {
        whereClause += ` AND p.status = 'Active'`;
      } else {
        whereClause = `WHERE p.status = 'Active'`;
      }
    }
    
    // Handle "most_popular" sorting - need to count order items
    let orderClause = '';
    let needsOrderCount = false;
    
    if (pagination.sortBy === 'total_orders') {
      needsOrderCount = true;
      const direction = pagination.sortDir && pagination.sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      orderClause = `ORDER BY total_orders ${direction}, p.created_at DESC`;
    } else {
      orderClause = buildOrderClause(pagination.sortBy, pagination.sortDir, ['name', 'price', 'stock', 'date_added', 'created_at'], 'p');
    }
    
    const paginationClause = buildPaginationClause(pagination.page, pagination.limit);
    
    let query = '';
    if (needsOrderCount) {
      // Include order count in SELECT and JOIN with order_items
      query = `
        SELECT p.*, 
               c.name as category_name,
               COALESCE(SUM(oi.quantity), 0) as total_orders
        FROM products p 
        LEFT JOIN categories c ON p.category_value_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        ${whereClause}
        GROUP BY p.id, c.name
        ${orderClause} 
        ${paginationClause}
      `;
    } else {
      // Regular query without order count
      query = `
        SELECT p.*, 
               c.name as category_name
        FROM products p 
        LEFT JOIN categories c ON p.category_value_id = c.id
        ${whereClause} 
        ${orderClause} 
        ${paginationClause}
      `;
    }
    
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
    
    // Handle size filtering at database level
    if (filters.size) {
      const sizes = filters.size.includes(',') ? filters.size.split(',').map(s => s.trim()) : [filters.size];
      const sizePlaceholders = sizes.map(() => '?').join(',');
      const sizeCondition = `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size IN (${sizePlaceholders}))`;
      
      if (whereClause) {
        whereClause += ` AND ${sizeCondition}`;
      } else {
        whereClause = `WHERE ${sizeCondition}`;
      }
      values.push(...sizes);
    }
    
    // Handle color filtering at database level
    if (filters.color) {
      const colors = filters.color.includes(',') ? filters.color.split(',').map(c => c.trim()) : [filters.color];
      const colorPlaceholders = colors.map(() => '?').join(',');
      const colorCondition = `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.color_name IN (${colorPlaceholders}))`;
      
      if (whereClause) {
        whereClause += ` AND ${colorCondition}`;
      } else {
        whereClause = `WHERE ${colorCondition}`;
      }
      values.push(...colors);
    }
    
    // Always filter for Active products in public endpoints (unless explicitly overridden)
    if (!filters.status) {
      if (whereClause) {
        whereClause += ` AND p.status = 'Active'`;
      } else {
        whereClause = `WHERE p.status = 'Active'`;
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
  static async getProductsByTypeWithFilters(type, filters = {}, pagination = {}) {
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
        // Use pagination object if provided, otherwise fall back to filters
        const paginationParams = pagination && pagination.sortBy ? pagination : {
          page: filters.page || 1,
          limit: filters.limit || 8,
          sortBy: pagination?.sortBy || 'created_at',
          sortDir: pagination?.sortDir || 'DESC'
        };
        
        products = await this.getProducts(filters, paginationParams);
    }

    return products;
  }

  // Get single product by ID
  static async getProductById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_value_id = c.id
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

    // Get fit options if fit is required
    let available_fits = [];
    if (product.fit_required) {
      try {
        // If product has specific fit_options configured (JSON string of values), filter by those
        let whereClause = `lh.name = 'Product Fit' AND lv.status = 'Active'`;
        const params = [];

        if (product.fit_options) {
          try {
            const fitValues = JSON.parse(product.fit_options);
            if (Array.isArray(fitValues) && fitValues.length > 0) {
              const placeholders = fitValues.map(() => '?').join(',');
              whereClause += ` AND lv.value IN (${placeholders})`;
              params.push(...fitValues);
            }
          } catch (e) {
            // If parsing fails, fall back to default behavior (all active fits)
          }
        } else if (product.default_fit) {
          // If only default_fit is set, return just that one option
          whereClause += ` AND lv.value = ?`;
          params.push(product.default_fit);
        }

        const [fitOptions] = await db.execute(
          `SELECT lv.value, lv.description 
           FROM lookup_values lv 
           JOIN lookup_headers lh ON lv.header_id = lh.id 
           WHERE ${whereClause}
           ORDER BY lv.value`,
          params
        );
        available_fits = fitOptions;
      } catch (error) {
        console.error('Error fetching fit options:', error);
        available_fits = [];
      }
    }

    return {
      ...product,
      images: images.map(img => img.image_url),
      variants,
      main_image: images.length > 0 ? images[0].image_url : null,
      available_fits
    };
  }

  // Get multiple products by IDs
  static async getProductsByIds(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    // Filter out invalid IDs and ensure they are integers
    const validIds = ids
      .map(id => parseInt(id))
      .filter(id => !isNaN(id) && id > 0);

    if (validIds.length === 0) {
      return [];
    }

    const placeholders = validIds.map(() => '?').join(',');
    const [rows] = await db.execute(`
      SELECT p.*, 
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_value_id = c.id
      WHERE p.id IN (${placeholders}) AND p.status = 'Active'
      ORDER BY FIELD(p.id, ${placeholders})
    `, [...validIds, ...validIds]);

    return await this.enrichProductsWithDetails(rows);
  }

  // Get recommended products (mix of trending, latest, and featured)
  static async getRecommendedProducts(limit = 8) {
    const [rows] = await db.execute(`
      SELECT p.*, 
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_value_id = c.id
      WHERE p.status = 'Active' 
        AND p.stock_status != 'Out of Stock'
      ORDER BY 
        CASE 
          WHEN p.discount_percentage > 20 THEN 1
          WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 2
          WHEN p.discount_percentage > 0 THEN 3
          ELSE 4
        END,
        p.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    return await this.enrichProductsWithDetails(rows);
  }
}

module.exports = PublicModule;
