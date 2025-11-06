const db = require('../config/db');
const { generateCode } = require('../utils/sql');
const ImageService = require('../utils/imageService');

class Product {
  static async create(productData) {
    const { name, description, category_value_id, price, original_price, current_price, stock, stock_status, status, images, variants, fit_required, default_fit, fit_options, materials_care, delivery_returns, return_exchanges, contact_info } = productData;
    
    // Validate category_value_id if provided
    if (category_value_id !== undefined && category_value_id !== null) {
      const [categoryExists] = await db.execute(
        'SELECT id FROM categories WHERE id = ?',
        [category_value_id]
      );
      
      if (categoryExists.length === 0) {
        throw new Error(`Category with ID ${category_value_id} does not exist. Available categories: 6 (Abayas), 7 (babies), 8 (children), 9 (Dresses), 10 (women)`);
      }
    }
    
    // Generate SKU from product name (first letter of each word + random string)
    const generateSkuFromName = (productName) => {
      if (!productName || productName.trim() === '') {
        // Fallback if no name provided
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `SKU-${timestamp}-${random}`.toUpperCase();
      }
      
      // Extract first letter of each word
      const words = productName.trim().split(/\s+/);
      const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      
      // Generate random string
      const random = Math.random().toString(36).substr(2, 8);
      
      return `${initials}-${random}`.toUpperCase();
    };
    
    const finalSku = generateSkuFromName(name);
    
    // Calculate discount percentage if both prices are provided
    let discount_percentage = null;
    if (original_price && current_price && original_price > current_price) {
      discount_percentage = Math.round(((original_price - current_price) / original_price) * 100 * 100) / 100;
    }
    
    // Calculate stock_status based on stock if not provided
    const finalStockStatus = stock_status || this.calculateStockStatus(stock || 0);
    
    const [result] = await db.execute(
      `INSERT INTO products (sku, name, description, category_value_id, price, original_price, current_price, discount_percentage, stock, stock_status, status, fit_required, default_fit, fit_options, materials_care, delivery_returns, return_exchanges, contact_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalSku, name, description, category_value_id, price, original_price, current_price, discount_percentage, stock, finalStockStatus, status, Boolean(fit_required), default_fit || null, fit_options || null, materials_care || null, delivery_returns || null, return_exchanges || null, contact_info || null]
    );
    
    const productId = result.insertId;
    
    // Generate code and update
    const code = generateCode('PRD', productId);
    await db.execute(
      'UPDATE products SET code = ? WHERE id = ?',
      [code, productId]
    );
    
    // Process and upload images
    let imageUrls = [];
    if (images && images.length > 0) {
      try {
        const folder = ImageService.getProductImageFolder(productId);
        imageUrls = await ImageService.processAndUploadImages(images, folder, {
          quality: 85,
          maxWidth: 1200,
          maxHeight: 1200,
          format: 'jpeg'
        });
        
        // Store image URLs in database
        for (let i = 0; i < imageUrls.length; i++) {
          await db.execute(
            'INSERT INTO product_images (product_id, image_url, `order`) VALUES (?, ?, ?)',
            [productId, imageUrls[i], i + 1]
          );
        }
      } catch (error) {
        console.error('Error processing product images:', error);
        // Continue with product creation even if image processing fails
      }
    }
    
    // Insert variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        let colorImageUrl = variant.color_image;
        
        // Process variant color image if it's base64
        if (variant.color_image && variant.color_image.startsWith('data:image/')) {
          try {
            const folder = ImageService.getVariantImageFolder(productId);
            colorImageUrl = await ImageService.processAndUploadImage(variant.color_image, folder, {
              quality: 85,
              maxWidth: 800,
              maxHeight: 800,
              format: 'jpeg'
            });
          } catch (error) {
            console.error('Error processing variant color image:', error);
            colorImageUrl = null; // Set to null if processing fails
          }
        }
        
        await db.execute(
          `INSERT INTO product_variants (product_id, size, color_name, color_code, color_image, sku, extra_price, stock) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           size = VALUES(size),
           color_name = VALUES(color_name),
           color_code = VALUES(color_code),
           color_image = VALUES(color_image),
           extra_price = VALUES(extra_price),
           stock = VALUES(stock)`,
          [productId, variant.size, variant.color_name, variant.color_code, colorImageUrl, variant.sku, variant.extra_price, variant.stock]
        );
      }
    }
    
    return this.findById(productId);
  }
  
  static async findAll(filters = {}, pagination = {}) {
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
    
    // Always filter for Active products (unless explicitly overridden via filters.status)
    if (!filters.status) {
      if (whereClause) {
        whereClause += ` AND p.status = 'Active'`;
      } else {
        whereClause = `WHERE p.status = 'Active'`;
      }
    }
    
    const query = `
      SELECT p.*, 
             c.name as category_name
      FROM products p 
      LEFT JOIN categories c ON p.category_value_id = c.id
      ${whereClause} 
      ${orderClause} 
      ${paginationClause}
    `;
    
    const [rows] = await db.execute(query, values);
    
    // Add default values for product information sections for each product
    const productsWithDefaults = rows.map(product => {
      if (!product.materials_care) {
        product.materials_care = 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.';
      }
      if (!product.delivery_returns) {
        product.delivery_returns = 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.';
      }
      if (!product.return_exchanges) {
        product.return_exchanges = 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.';
      }
      if (!product.contact_info) {
        product.contact_info = 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.';
      }
      return product;
    });
    
    return productsWithDefaults;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT p.*, 
              c.name as category_name
       FROM products p 
       LEFT JOIN categories c ON p.category_value_id = c.id
       WHERE p.id = ? AND p.status = 'Active'`,
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
      `SELECT pv.*
       FROM product_variants pv 
       WHERE pv.product_id = ?`,
      [id]
    );
    product.variants = variants;
    
    // Get fit options if fit is required
    if (product.fit_required) {
      try {
        const [fitOptions] = await db.execute(
          `SELECT lv.value, lv.description 
           FROM lookup_values lv 
           JOIN lookup_headers lh ON lv.header_id = lh.id 
           WHERE lh.name = 'Product Fit' AND lv.status = 'Active'
           ORDER BY lv.value`,
          []
        );
        product.available_fits = fitOptions;
      } catch (error) {
        console.error('Error fetching fit options:', error);
        product.available_fits = [];
      }
    }
    
    // Add default values for product information sections if they are empty
    if (!product.materials_care) {
      product.materials_care = 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.';
    }
    if (!product.delivery_returns) {
      product.delivery_returns = 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.';
    }
    if (!product.return_exchanges) {
      product.return_exchanges = 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.';
    }
    if (!product.contact_info) {
      product.contact_info = 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.';
    }
    
    return product;
  }
  
  static async count(filters = {}) {
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
    
    // Always filter for Active products (unless explicitly overridden via filters.status)
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
  
  static async update(id, updateData) {
    const { images, variants, original_price, current_price, ...productData } = updateData;
    
    // Validate category_value_id if provided
    if (productData.category_value_id !== undefined && productData.category_value_id !== null) {
      const [categoryExists] = await db.execute(
        'SELECT id FROM categories WHERE id = ?',
        [productData.category_value_id]
      );
      
      if (categoryExists.length === 0) {
        throw new Error(`Category with ID ${productData.category_value_id} does not exist. Available categories: 6 (Abayas), 7 (babies), 8 (children), 9 (Dresses), 10 (women)`);
      }
    }
    
    const fields = [];
    const values = [];
    
    // Calculate discount percentage if both prices are provided
    let discount_percentage = null;
    if (original_price && current_price && original_price > current_price) {
      discount_percentage = Math.round(((original_price - current_price) / original_price) * 100 * 100) / 100;
    }
    
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        // Convert fit_required from number to boolean if needed
        if (key === 'fit_required') {
          values.push(Boolean(value));
        } else {
          values.push(value);
        }
      }
    });
    
    // If stock is being updated, also update stock_status based on new stock value
    if (productData.stock !== undefined) {
      const stockStatus = this.calculateStockStatus(productData.stock);
      fields.push('stock_status = ?');
      values.push(stockStatus);
    }
    
    // Add price fields if provided
    if (original_price !== undefined) {
      fields.push('original_price = ?');
      values.push(original_price);
    }
    if (current_price !== undefined) {
      fields.push('current_price = ?');
      values.push(current_price);
    }
    if (discount_percentage !== null) {
      fields.push('discount_percentage = ?');
      values.push(discount_percentage);
    }
    
    if (fields.length > 0) {
      values.push(id);
      await db.execute(
        `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }
    
    // Update images if provided
    if (images !== undefined) {
      // Separate existing URLs from new base64 images
      const existingUrls = [];
      const newBase64Images = [];
      
      images.forEach(image => {
        if (typeof image === 'string') {
          if (image.startsWith('http') || image.startsWith('data:')) {
            if (image.startsWith('data:')) {
              newBase64Images.push(image);
            } else {
              existingUrls.push(image);
            }
          }
        }
      });
      
      // Get current images from database
      const [currentImages] = await db.execute(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY `order`',
        [id]
      );
      const currentUrls = currentImages.map(img => img.image_url);
      
      // Find images to delete (current images not in the new list)
      const imagesToDelete = currentUrls.filter(url => !existingUrls.includes(url));
      
      // Delete removed images from storage
      if (imagesToDelete.length > 0) {
        try {
          await ImageService.deleteImages(imagesToDelete);
        } catch (error) {
          console.error('Error deleting removed images:', error);
        }
      }
      
      // Delete all existing image records from database
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      
      // Process and upload new base64 images
      let newImageUrls = [];
      if (newBase64Images.length > 0) {
        try {
          const folder = ImageService.getProductImageFolder(id);
          newImageUrls = await ImageService.processAndUploadImages(newBase64Images, folder, {
            quality: 85,
            maxWidth: 1200,
            maxHeight: 1200,
            format: 'jpeg'
          });
        } catch (error) {
          console.error('Error processing new images:', error);
          throw new Error(`Image processing failed: ${error.message}`);
        }
      }
      
      // Combine existing URLs with new URLs
      const allImageUrls = [...existingUrls, ...newImageUrls];
      
      // Store all image URLs in database
      for (let i = 0; i < allImageUrls.length; i++) {
        await db.execute(
          'INSERT INTO product_images (product_id, image_url, `order`) VALUES (?, ?, ?)',
          [id, allImageUrls[i], i + 1]
        );
      }
    }
    
    // Update variants if provided
    if (variants !== undefined) {
      // Get existing variant images to delete from storage
      const [existingVariants] = await db.execute(
        'SELECT color_image FROM product_variants WHERE product_id = ? AND color_image IS NOT NULL',
        [id]
      );
      
      // Delete existing variant images from storage
      if (existingVariants.length > 0) {
        const existingUrls = existingVariants
          .map(variant => variant.color_image)
          .filter(url => url && !url.startsWith('data:image/')); // Only delete URLs, not base64 data
        if (existingUrls.length > 0) {
          try {
            await ImageService.deleteImages(existingUrls);
          } catch (error) {
            console.error('Error deleting existing variant images:', error);
          }
        }
      }
      
      // Handle variants: Update existing, insert new, delete removed
      if (variants.length > 0) {
        const variantIds = [];
        
        for (const variant of variants) {
          let colorImageUrl = variant.color_image;
          
          // Process variant color image if it's base64
          if (variant.color_image && variant.color_image.startsWith('data:image/')) {
            try {
              const folder = ImageService.getVariantImageFolder(id);
              colorImageUrl = await ImageService.processAndUploadImage(variant.color_image, folder, {
                quality: 85,
                maxWidth: 800,
                maxHeight: 800,
                format: 'jpeg'
              });
            } catch (error) {
              console.error('Error processing variant color image:', error);
              colorImageUrl = null; // Set to null if processing fails
            }
          }
          
          // If variant has ID, UPDATE existing variant
          if (variant.id) {
            await db.execute(
              `UPDATE product_variants 
               SET size = ?, color_name = ?, color_code = ?, color_image = ?, sku = ?, extra_price = ?, stock = ?
               WHERE id = ? AND product_id = ?`,
              [variant.size, variant.color_name, variant.color_code, colorImageUrl, variant.sku, variant.extra_price, variant.stock, variant.id, id]
            );
            variantIds.push(variant.id);
          } 
          // If no ID, INSERT new variant
          else {
            const [result] = await db.execute(
              `INSERT INTO product_variants (product_id, size, color_name, color_code, color_image, sku, extra_price, stock) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [id, variant.size, variant.color_name, variant.color_code, colorImageUrl, variant.sku, variant.extra_price, variant.stock]
            );
            variantIds.push(result.insertId);
          }
        }
        
        // Delete variants that are no longer in the update payload
        if (variantIds.length > 0) {
          await db.execute(
            `DELETE FROM product_variants WHERE product_id = ? AND id NOT IN (${variantIds.map(() => '?').join(',')})`,
            [id, ...variantIds]
          );
        }
      } else {
        // If no variants provided, delete all variants for this product
        await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      }
    }
    
    return this.findById(id);
  }
  
  static async delete(id) {
    // Get all images associated with this product
    const [productImages] = await db.execute(
      'SELECT image_url FROM product_images WHERE product_id = ?',
      [id]
    );
    
    const [variantImages] = await db.execute(
      'SELECT color_image FROM product_variants WHERE product_id = ? AND color_image IS NOT NULL',
      [id]
    );
    
    // Collect all image URLs to delete
    const allImageUrls = [
      ...productImages.map(img => img.image_url),
      ...variantImages.map(variant => variant.color_image).filter(url => url && !url.startsWith('data:image/'))
    ];
    
    // Delete images from storage
    if (allImageUrls.length > 0) {
      try {
        await ImageService.deleteImages(allImageUrls);
      } catch (error) {
        console.error('Error deleting product images:', error);
        // Continue with deletion even if image cleanup fails
      }
    }
    
    // Soft delete: Set status to 'Inactive' instead of hard delete
    // This preserves the product for historical order records while marking it as deleted
    await db.execute('UPDATE products SET status = ? WHERE id = ?', ['Inactive', id]);
    console.log(`✅ Product ${id} soft deleted (status set to Inactive)`);
    return true;
  }
  
  // Helper function to calculate stock_status based on stock quantity
  static calculateStockStatus(stock) {
    if (stock <= 0) {
      return 'Out of Stock';
    } else if (stock < 10) {
      return 'Low Stock';
    } else {
      return 'Active';
    }
  }

  static async updateStock(id, quantity) {
    // Update stock and recalculate stock_status
    await db.execute(
      `UPDATE products 
       SET stock = stock - ?, 
           stock_status = CASE 
             WHEN stock - ? <= 0 THEN 'Out of Stock'
             WHEN stock - ? < 10 THEN 'Low Stock'
             ELSE 'Active'
           END
       WHERE id = ?`,
      [quantity, quantity, quantity, id]
    );
  }
  
  static async updateVariantStock(variantId, quantity) {
    await db.execute(
      'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
      [quantity, variantId]
    );
  }
  
  // Update product stock_status based on current stock
  static async updateStockStatus(productId) {
    const [rows] = await db.execute(
      'SELECT stock FROM products WHERE id = ?',
      [productId]
    );
    
    if (rows.length > 0) {
      const stock = rows[0].stock;
      const stockStatus = this.calculateStockStatus(stock);
      
      await db.execute(
        'UPDATE products SET stock_status = ? WHERE id = ?',
        [stockStatus, productId]
      );
    }
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
}

module.exports = Product;
