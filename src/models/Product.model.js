const db = require('../config/db');
const { generateCode } = require('../utils/sql');
const ImageService = require('../utils/imageService');

class Product {
  static async create(productData) {
    const { name, description, category_value_id, price, original_price, current_price, stock, stock_status, status, images, variants } = productData;
    
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
    
    const [result] = await db.execute(
      `INSERT INTO products (sku, name, description, category_value_id, price, original_price, current_price, discount_percentage, stock, stock_status, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalSku, name, description, category_value_id, price, original_price, current_price, discount_percentage, stock, stock_status, status]
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
    return rows;
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT p.*, 
              c.name as category_name
       FROM products p 
       LEFT JOIN categories c ON p.category_value_id = c.id
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
      `SELECT pv.*
       FROM product_variants pv 
       WHERE pv.product_id = ?`,
      [id]
    );
    product.variants = variants;
    
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
        values.push(value);
      }
    });
    
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
      
      await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      if (variants.length > 0) {
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
            [id, variant.size, variant.color_name, variant.color_code, colorImageUrl, variant.sku, variant.extra_price, variant.stock]
          );
        }
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
    
    // Delete from database (cascading deletes should handle related records)
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
