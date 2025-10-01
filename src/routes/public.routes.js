const router = require('express').Router();
const { validateBody } = require('../middleware/validate');
const { customerSignup, customerLogin } = require('../validators/public');
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

// Add more public routes here in the future
// router.get('/categories', publicCtrl.getCategories);
// router.get('/settings', publicCtrl.getSettings);
// etc.

module.exports = router;
