const Category = require('../models/Category.model');
const responses = require('../utils/responses');
const ImageService = require('../utils/imageService');
const path = require('path');
const fs = require('fs').promises;

// List categories with pagination and filters
const listCategories = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const categories = await Category.findAll(filters, { page, limit, ...req.query });
    const total = await Category.count(filters);
    
    res.json(responses.ok(categories, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Categories list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch categories'));
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json(responses.notFound('Category'));
    }
    
    res.json(responses.ok(category));
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json(responses.internalError('Failed to fetch category'));
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    let imageUrl = null;
    
    // Handle image upload if provided
    if (req.file) {
      try {
        // Generate public URL for the uploaded image
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        imageUrl = `${baseUrl}/uploads/categories/${req.file.filename}`;
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Continue without image if processing fails
      }
    }
    
    const categoryData = {
      ...req.body,
      image_url: imageUrl,
      created_by: req.user.id
    };
    
    const category = await Category.create(categoryData);
    res.status(201).json(responses.created(category));
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json(responses.internalError('Failed to create category'));
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] 🛠️ Update Category called`, { id, body: req.body });
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json(responses.notFound('Category'));
    }
    
    const updateData = { ...req.body };
    console.log(`[${new Date().toISOString()}] 🧩 Update payload before processing`, updateData);
    
    // Handle image upload if provided
    if (req.file) {
      try {
        // Delete old image if exists
        if (existingCategory.image_url) {
          await ImageService.deleteFromLocal(existingCategory.image_url);
        }
        
        // Generate public URL for the new image
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        updateData.image_url = `${baseUrl}/uploads/categories/${req.file.filename}`;
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        return res.status(500).json(responses.internalError('Failed to process image'));
      }
    }
    
    const category = await Category.update(id, updateData);
    console.log(`[${new Date().toISOString()}] ✅ Category updated`, { id, status: category?.status });
    res.json(responses.ok(category));
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json(responses.internalError('Failed to update category'));
  }
};

// Upload category image
const uploadCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json(responses.badRequest('No image file provided'));
    }
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json(responses.notFound('Category'));
    }
    
    // Delete old image if exists
    if (existingCategory.image_url) {
      await ImageService.deleteFromLocal(existingCategory.image_url);
    }
    
    // Generate public URL for the new image
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/categories/${req.file.filename}`;
    
    // Update category with new image URL
    const updateData = { image_url: imageUrl };
    const category = await Category.update(id, updateData);
    
    res.json(responses.ok(category));
  } catch (error) {
    console.error('Upload category image error:', error);
    res.status(500).json(responses.internalError('Failed to upload category image'));
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // Allow force delete
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json(responses.notFound('Category'));
    }
    
    // Delete associated image if exists
    if (existingCategory.image_url) {
      await ImageService.deleteFromLocal(existingCategory.image_url);
    }
    
    await Category.delete(id, force === 'true');
    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    
    if (error.message.includes('Cannot delete category')) {
      return res.status(400).json(responses.badRequest(error.message));
    }
    
    res.status(500).json(responses.internalError('Failed to delete category'));
  }
};

// Removed: getRootCategories, getCategoriesByParent, getCategoryHierarchy, updateSortOrder, uploadCategoryImage - keeping it simple

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  uploadCategoryImage,
  deleteCategory
};
