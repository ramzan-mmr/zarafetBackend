const express = require('express');
const multer = require('multer');
const path = require('path');
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

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadDir = 'uploads/categories/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size too large. Maximum size is 5MB.'
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Only image files are allowed!'
      }
    });
  }
  
  next(error);
};

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

// Create category with image (Admin/Manager only)
router.post('/',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  validateBody(createCategory),
  categoriesController.createCategory
);

// Update category with image (Admin/Manager only)
router.put('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  validateParams(categoryId),
  validateBody(updateCategory),
  categoriesController.updateCategory
);

// Upload category image only (Admin/Manager only)
router.post('/:id/image',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  validateParams(categoryId),
  categoriesController.uploadCategoryImage
);

// Delete category (Admin/Manager only)
router.delete('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  validateParams(categoryId),
  categoriesController.deleteCategory
);

// Removed: sort order and upload image endpoints - keeping it simple

module.exports = router;
