const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { add } = require('../validators/wishlist');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/wishlist.controller');
// All routes require authentication
router.use(verifyJWT);
router.get('/wishlist', ctrl.getWishlist);
router.post('/wishlist',
  validateBody(add),
  ctrl.addToWishlist
);
router.delete('/wishlist/:product_id',
  validateParams(idParam),
  ctrl.removeFromWishlist
);
router.get('/recently-viewed',
  validateQuery(require('joi').object({
    limit: require('joi').number().integer().min(1).max(50).default(10)
  })),
  ctrl.getRecentlyViewed
);
router.post('/recently-viewed',
  validateBody(require('joi').object({
    product_id: require('joi').number().integer().positive().required()
  })),
  ctrl.addToRecentlyViewed
);
module.exports = router;
