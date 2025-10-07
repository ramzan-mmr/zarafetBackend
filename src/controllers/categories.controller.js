const Category = require('../models/Category.model');
const responses = require('../utils/responses');

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
    const categoryData = {
      ...req.body,
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
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json(responses.notFound('Category'));
    }
    
    const updateData = { ...req.body };
    const category = await Category.update(id, updateData);
    res.json(responses.ok(category));
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json(responses.internalError('Failed to update category'));
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json(responses.notFound('Category'));
    }
    
    await Category.delete(id);
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
  deleteCategory
};
