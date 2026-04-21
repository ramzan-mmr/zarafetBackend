const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Multer configuration for banner image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadDir = 'uploads/banners/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 1 * 1024 * 1024 // 1MB limit
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
          message: 'File size too large. Maximum size is 1MB.'
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

// List all banners
router.get('/',
  bannerController.list
);

// Get banner by ID
router.get('/:id',
  bannerController.getById
);

// Create banner (Admin/Manager only)
router.post('/',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  bannerController.create
);

// Update banner (Admin/Manager only)
router.put('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  upload.single('image'),
  handleMulterError,
  bannerController.update
);

// Delete banner (Admin/Manager only)
router.delete('/:id',
  checkRole(['Super_Admin', 'Admin', 'Manager']),
  bannerController.remove
);

module.exports = router;
