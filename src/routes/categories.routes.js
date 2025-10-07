const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/categories.controller');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { parsePagination } = require('../middleware/paginate');
const {
  createCategory,
  updateCategory,
  categoryId,
  listQuery
} = require('../validators/categories');

// Removed: multer configuration - no image upload needed

// Admin routes (protected)
router.use(verifyJWT); // All routes below require authentication

// List categories with pagination
router.get('/', 
  validateQuery(listQuery),
  parsePagination,
  categoriesController.listCategories
);

// Get category by ID
router.get('/:id',
  validateParams(categoryId),
  categoriesController.getCategoryById
);

// Removed: root categories, parent categories, hierarchy - keeping it simple

// Create category (Admin/Manager only)
router.post('/',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  validateBody(createCategory),
  categoriesController.createCategory
);

// Update category (Admin/Manager only)
router.put('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  validateParams(categoryId),
  validateBody(updateCategory),
  categoriesController.updateCategory
);

// Delete category (Admin/Manager only)
router.delete('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  validateParams(categoryId),
  categoriesController.deleteCategory
);

// Removed: sort order and upload image endpoints - keeping it simple

module.exports = router;
