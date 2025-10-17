const router = require('express').Router();
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { customerSignup, customerLogin, addressCreate, addressUpdate } = require('../validators/public');
const { idParam } = require('../validators/common');
const { publicCategoryQuery } = require('../validators/categories');
const publicCtrl = require('../controllers/public.controller');

/**
 * @swagger
 * tags:
 *   name: Public APIs
 *   description: Public endpoints for website access (no authentication required)
 */

/**
 * @swagger
 * /public/lookups/values:
 *   post:
 *     summary: Get lookup values by header IDs
 *     tags: [Public APIs]
 *     description: Get lookup values grouped by header ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - header_ids
 *             properties:
 *               header_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Lookup values retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /public/products:
 *   get:
 *     summary: Get products with filters
 *     tags: [Public APIs]
 *     description: Get products with various filters like category, size, color, price range, etc.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID filter (single ID or comma-separated multiple IDs like "6,5,4,7,3")
 *       - in: query
 *         name: stock_status
 *         schema:
 *           type: string
 *           enum: [In Stock, Out of Stock]
 *         description: Stock status filter
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Size filter (single size or comma-separated multiple sizes like "M,S")
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Color filter (name or code)
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name/description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_low_high, price_high_low, name_a_z, most_popular]
 *           default: newest
 *         description: Frontend-friendly sort option
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, price, created_at]
 *           default: created_at
 *         description: Sort field (alternative to sort parameter)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order (alternative to sort parameter)
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Internal server error
 */

// Lookup routes
router.post('/lookups/values', publicCtrl.getLookupValues);

// Product routes
router.get('/products', publicCtrl.getProducts);

/**
 * @swagger
 * /public/products/trending:
 *   get:
 *     summary: Get trending products
 *     tags: [Public APIs]
 *     description: Get products with highest discounts (trending products)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Trending products retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/products/trending', publicCtrl.getTrendingProducts);

/**
 * @swagger
 * /public/products/latest:
 *   get:
 *     summary: Get latest arrival products
 *     tags: [Public APIs]
 *     description: Get the most recently added products
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Latest products retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/products/latest', publicCtrl.getLatestProducts);

/**
 * @swagger
 * /public/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Public APIs]
 *     description: Get products with high discounts or recently added (featured products)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/products/featured', publicCtrl.getFeaturedProducts);

/**
 * @swagger
 * /public/products/bulk:
 *   get:
 *     summary: Get multiple products by IDs
 *     tags: [Public APIs]
 *     description: Get detailed information about multiple products by providing comma-separated product IDs
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated product IDs (e.g., "1,2,3,4")
 *         example: "1,2,3,4"
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Summer Dress"
 *                       price:
 *                         type: number
 *                         example: 99.99
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["image1.jpg", "image2.jpg"]
 *                       variants:
 *                         type: array
 *                         items:
 *                           type: object
 *                 message:
 *                   type: string
 *                   example: "Retrieved 3 products successfully"
 *       400:
 *         description: Bad request - Invalid or missing product IDs
 *       500:
 *         description: Internal server error
 */
router.get('/products/bulk', publicCtrl.getProductsByIds);

/**
 * @swagger
 * /public/products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Public APIs]
 *     description: Get detailed information about a specific product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/products/:id', publicCtrl.getProductById);

// Customer authentication routes
/**
 * @swagger
 * /public/auth/signup:
 *   post:
 *     summary: Customer signup
 *     tags: [Public APIs]
 *     description: Register a new customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 64
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Validation error or password mismatch
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/auth/signup', validateBody(customerSignup), publicCtrl.customerSignup);

/**
 * @swagger
 * /public/auth/login:
 *   post:
 *     summary: Customer login
 *     tags: [Public APIs]
 *     description: Login for existing customers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or inactive account
 *       500:
 *         description: Internal server error
 */
router.post('/auth/login', validateBody(customerLogin), publicCtrl.customerLogin);

// OTP verification routes for customers
/**
 * @swagger
 * /public/otp/send:
 *   post:
 *     summary: Send OTP for email verification
 *     tags: [Public APIs]
 *     description: Send OTP to customer's email for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "customer@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found
 *       403:
 *         description: Invalid user type
 *       500:
 *         description: Failed to send OTP
 */
router.post('/otp/send', publicCtrl.sendOTP);

/**
 * @swagger
 * /public/otp/verify:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Public APIs]
 *     description: Verify OTP code and mark email as verified
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "customer@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Failed to verify OTP
 */
router.post('/otp/verify', publicCtrl.verifyOTP);

/**
 * @swagger
 * /public/otp/resend:
 *   post:
 *     summary: Resend OTP code
 *     tags: [Public APIs]
 *     description: Resend OTP code to customer's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "customer@example.com"
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found
 *       403:
 *         description: Invalid user type
 *       500:
 *         description: Failed to resend OTP
 */
router.post('/otp/resend', publicCtrl.resendOTP);

/**
 * @swagger
 * /public/addresses:
 *   get:
 *     summary: Get customer addresses
 *     tags: [Public APIs]
 *     description: Get all addresses for the authenticated customer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/addresses', verifyJWT, publicCtrl.getAddresses);

/**
 * @swagger
 * /public/addresses:
 *   post:
 *     summary: Create new address
 *     tags: [Public APIs]
 *     description: Create a new address for the authenticated customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - line1
 *             properties:
 *               label:
 *                 type: string
 *                 maxLength: 50
 *                 default: Home
 *                 example: "Home"
 *               line1:
 *                 type: string
 *                 maxLength: 150
 *                 example: "123 Main Street"
 *               line2:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Apt 4B"
 *               city_value_id:
 *                 type: integer
 *                 example: 1
 *               postal_code:
 *                 type: string
 *                 maxLength: 20
 *                 example: "12345"
 *               phone:
 *                 type: string
 *                 maxLength: 30
 *                 example: "+1234567890"
 *               is_default:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/addresses', verifyJWT, validateBody(addressCreate), publicCtrl.createAddress);

/**
 * @swagger
 * /public/addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Public APIs]
 *     description: Get a specific address by ID for the authenticated customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *       403:
 *         description: Address does not belong to you
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/addresses/:id', verifyJWT, validateParams(idParam), publicCtrl.getAddressById);

/**
 * @swagger
 * /public/addresses/{id}:
 *   put:
 *     summary: Update address
 *     tags: [Public APIs]
 *     description: Update an existing address for the authenticated customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Office"
 *               line1:
 *                 type: string
 *                 maxLength: 150
 *                 example: "123 Main Street"
 *               line2:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Apt 4B"
 *               city_value_id:
 *                 type: integer
 *                 example: 1
 *               postal_code:
 *                 type: string
 *                 maxLength: 20
 *                 example: "12345"
 *               phone:
 *                 type: string
 *                 maxLength: 30
 *                 example: "+1234567890"
 *               is_default:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Address does not belong to you
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/addresses/:id', verifyJWT, validateParams(idParam), validateBody(addressUpdate), publicCtrl.updateAddress);

/**
 * @swagger
 * /public/addresses/{id}:
 *   delete:
 *     summary: Delete address
 *     tags: [Public APIs]
 *     description: Delete an address for the authenticated customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       403:
 *         description: Address does not belong to you
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/addresses/:id', verifyJWT, validateParams(idParam), publicCtrl.deleteAddress);

// Category routes - Simplified
/**
 * @swagger
 * /public/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Public APIs]
 *     description: Get all active categories
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *           default: Active
 *         description: Category status filter
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/categories', validateQuery(publicCategoryQuery), publicCtrl.getCategories);

// Wishlist routes (require authentication)
/**
 * @swagger
 * /public/wishlist:
 *   get:
 *     summary: Get user wishlist
 *     tags: [Public APIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/wishlist', verifyJWT, publicCtrl.getWishlist);

/**
 * @swagger
 * /public/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Public APIs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product added to wishlist
 *       409:
 *         description: Product already in wishlist
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/wishlist', verifyJWT, validateBody(require('../validators/wishlist').add), publicCtrl.addToWishlist);

/**
 * @swagger
 * /public/wishlist/{product_id}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Public APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       404:
 *         description: Product not in wishlist
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/wishlist/:product_id', verifyJWT, validateParams(idParam), publicCtrl.removeFromWishlist);

// Recently viewed routes (require authentication, limit to 3 products)
/**
 * @swagger
 * /public/recently-viewed:
 *   get:
 *     summary: Get user's recently viewed products (max 3)
 *     tags: [Public APIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/recently-viewed', verifyJWT, publicCtrl.getRecentlyViewed);

/**
 * @swagger
 * /public/recently-viewed:
 *   post:
 *     summary: Add product to recently viewed (max 3 products)
 *     tags: [Public APIs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product added to recently viewed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/recently-viewed', verifyJWT, validateBody(require('joi').object({
  product_id: require('joi').number().integer().positive().required()
})), publicCtrl.addToRecentlyViewed);

// Debug endpoint to test database connection
router.get('/debug-db', async (req, res) => {
  try {
    const db = require('../config/db');
    const [results] = await db.execute('SELECT COUNT(*) as count FROM categories');
    res.json({
      success: true,
      data: results,
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Add more public routes here in the future
// router.get('/settings', publicCtrl.getSettings);
// etc.

module.exports = router;
