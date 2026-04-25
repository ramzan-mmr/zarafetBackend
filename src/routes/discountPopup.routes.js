const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const discountPopupController = require('../controllers/discountPopup.controller');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Multer configuration for discount popup image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadDir = 'uploads/discount-popups/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'discount-popup-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 2 * 1024 * 1024 // 2MB limit
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
          message: 'File size too large. Maximum size is 2MB.'
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

// All routes require authentication
router.use(verifyJWT);

// List all discount popups
router.get('/',
  discountPopupController.list
);

// Get discount popup by ID
router.get('/:id',
  discountPopupController.getById
);

// Create discount popup (Admin/Manager only)
router.post('/',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  discountPopupController.create
);

// Update discount popup (Admin/Manager only)
router.put('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  discountPopupController.update
);

// Delete discount popup (Admin/Manager only)
router.delete('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  discountPopupController.remove
);

module.exports = router;
