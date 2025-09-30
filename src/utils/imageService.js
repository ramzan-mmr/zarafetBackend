const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Local storage configuration
const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class ImageService {
  /**
   * Convert base64 image to buffer and optimize it
   * @param {string} base64Data - Base64 encoded image data
   * @param {Object} options - Sharp processing options
   * @returns {Buffer} - Optimized image buffer
   */
  static async processImage(base64Data, options = {}) {
    try {
      // Remove data URL prefix if present
      const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64String, 'base64');
      
      // Default optimization settings
      const defaultOptions = {
        quality: 85,
        maxWidth: 1200,
        maxHeight: 1200,
        format: 'jpeg'
      };
      
      const settings = { ...defaultOptions, ...options };
      
      // Process image with Sharp
      let sharpInstance = sharp(imageBuffer);
      
      // Resize if needed
      if (settings.maxWidth || settings.maxHeight) {
        sharpInstance = sharpInstance.resize(settings.maxWidth, settings.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Convert to specified format and optimize
      if (settings.format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: settings.quality });
      } else if (settings.format === 'png') {
        sharpInstance = sharpInstance.png({ quality: settings.quality });
      } else if (settings.format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: settings.quality });
      }
      
      return await sharpInstance.toBuffer();
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Upload image to local storage
   * @param {Buffer} imageBuffer - Processed image buffer
   * @param {string} folder - Folder path (e.g., 'products', 'variants')
   * @param {string} filename - Filename for the image
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  static async uploadToLocal(imageBuffer, folder, filename) {
    try {
      // Create full directory path
      const fullPath = path.join(process.cwd(), UPLOADS_DIR, folder);
      
      // Ensure directory exists
      await fs.mkdir(fullPath, { recursive: true });
      
      // Create file path
      const filePath = path.join(fullPath, filename);
      
      // Write file to disk
      await fs.writeFile(filePath, imageBuffer);
      
      // Return public URL
      const publicUrl = `${BASE_URL}/${UPLOADS_DIR}/${folder}/${filename}`;
      return publicUrl;
    } catch (error) {
      console.error('Error uploading to local storage:', error);
      throw new Error('Failed to upload image to local storage');
    }
  }

  /**
   * Delete image from local storage
   * @param {string} imageUrl - Full URL of the image to delete
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteFromLocal(imageUrl) {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const relativePath = url.pathname.substring(1); // Remove leading slash
      const fullPath = path.join(process.cwd(), relativePath);
      
      // Check if file exists and delete
      try {
        await fs.access(fullPath);
        await fs.unlink(fullPath);
        return true;
      } catch (fileError) {
        console.log('File not found or already deleted:', fullPath);
        return true; // Consider it successful if file doesn't exist
      }
    } catch (error) {
      console.error('Error deleting from local storage:', error);
      return false;
    }
  }

  /**
   * Generate unique filename
   * @returns {string} - Unique filename
   */
  static generateUniqueFilename() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomBytes}.jpg`;
  }

  /**
   * Process and upload a single base64 image
   * @param {string} base64Data - Base64 encoded image
   * @param {string} folder - Folder path (e.g., 'products', 'variants')
   * @param {Object} options - Image processing options
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  static async processAndUploadImage(base64Data, folder, options = {}) {
    try {
      // Generate unique filename
      const filename = this.generateUniqueFilename();
      
      // Process image
      const processedBuffer = await this.processImage(base64Data, options);
      
      // Upload to local storage
      const imageUrl = await this.uploadToLocal(processedBuffer, folder, filename);
      
      return imageUrl;
    } catch (error) {
      console.error('Error processing and uploading image:', error);
      throw error;
    }
  }

  /**
   * Process and upload multiple base64 images
   * @param {Array<string>} base64Images - Array of base64 encoded images
   * @param {string} folder - Folder path
   * @param {Object} options - Image processing options
   * @returns {Promise<Array<string>>} - Array of image URLs
   */
  static async processAndUploadImages(base64Images, folder, options = {}) {
    try {
      const uploadPromises = base64Images.map(base64Data => 
        this.processAndUploadImage(base64Data, folder, options)
      );
      
      const imageUrls = await Promise.all(uploadPromises);
      return imageUrls;
    } catch (error) {
      console.error('Error processing and uploading images:', error);
      throw error;
    }
  }

  /**
   * Delete multiple images from local storage
   * @param {Array<string>} imageUrls - Array of image URLs to delete
   * @returns {Promise<Array<boolean>>} - Array of deletion results
   */
  static async deleteImages(imageUrls) {
    try {
      const deletePromises = imageUrls.map(url => this.deleteFromLocal(url));
      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      console.error('Error deleting images:', error);
      throw error;
    }
  }

  /**
   * Generate folder path for product images
   * @param {number} productId - Product ID
   * @returns {string} - Folder path
   */
  static getProductImageFolder(productId) {
    return `products/${productId}`;
  }

  /**
   * Generate folder path for variant images
   * @param {number} productId - Product ID
   * @param {number} variantId - Variant ID (optional)
   * @returns {string} - Folder path
   */
  static getVariantImageFolder(productId, variantId = null) {
    if (variantId) {
      return `products/${productId}/variants/${variantId}`;
    }
    return `products/${productId}/variants`;
  }
}

module.exports = ImageService;
