const router = require('express').Router();
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { customerSignup, customerLogin, addressCreate, addressUpdate } = require('../validators/public');
const { idParam } = require('../validators/common');
const { publicCategoryQuery } = require('../validators/categories');
const { contactForm } = require('../validators/contact');
const publicCtrl = require('../controllers/public.controller');
// Lookup routes
router.post('/lookups/values', publicCtrl.getLookupValues);
// Product routes
router.get('/products', publicCtrl.getProducts);
router.get('/products/trending', publicCtrl.getTrendingProducts);
router.get('/products/latest', publicCtrl.getLatestProducts);
router.get('/products/featured', publicCtrl.getFeaturedProducts);
router.get('/products/bulk', publicCtrl.getProductsByIds);
router.get('/products/:id', publicCtrl.getProductById);
// Customer authentication routes
router.post('/auth/signup', validateBody(customerSignup), publicCtrl.customerSignup);
router.post('/auth/login', validateBody(customerLogin), publicCtrl.customerLogin);
// OTP verification routes for customers
router.post('/otp/send', publicCtrl.sendOTP);
router.post('/otp/verify', publicCtrl.verifyOTP);
router.post('/otp/resend', publicCtrl.resendOTP);
router.get('/addresses', verifyJWT, publicCtrl.getAddresses);
router.post('/addresses', verifyJWT, validateBody(addressCreate), publicCtrl.createAddress);
router.get('/addresses/:id', verifyJWT, validateParams(idParam), publicCtrl.getAddressById);
router.put('/addresses/:id', verifyJWT, validateParams(idParam), validateBody(addressUpdate), publicCtrl.updateAddress);
router.delete('/addresses/:id', verifyJWT, validateParams(idParam), publicCtrl.deleteAddress);
// Category routes - Simplified
router.get('/categories', validateQuery(publicCategoryQuery), publicCtrl.getCategories);
// Contact form route (no authentication required)
router.post('/contact', validateBody(contactForm), publicCtrl.submitContactForm);
// Wishlist routes (require authentication)
router.get('/wishlist', verifyJWT, publicCtrl.getWishlist);
router.post('/wishlist', verifyJWT, validateBody(require('../validators/wishlist').add), publicCtrl.addToWishlist);
router.delete('/wishlist/:product_id', verifyJWT, validateParams(require('../validators/wishlist').productIdParam), publicCtrl.removeFromWishlist);
// Recently viewed routes (require authentication, limit to 3 products)
router.get('/recently-viewed', verifyJWT, publicCtrl.getRecentlyViewed);
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
