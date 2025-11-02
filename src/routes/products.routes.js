const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { listQuery, create, update } = require('../validators/products');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/products.controller');
// All routes require authentication
router.use(verifyJWT);
router.get('/',
  parsePagination,
  validateQuery(listQuery),
  ctrl.list
);
router.get('/:id',
  validateParams(idParam),
  ctrl.getById
);
// Create, update, delete require manager/admin role
router.post('/',
  checkRole(['Admin', 'Manager']),
  validateBody(create),
  ctrl.create
);
router.put('/:id',
  checkRole(['Admin', 'Manager']),
  validateParams(idParam),
  validateBody(update),
  ctrl.update
);
router.delete('/:id',
  checkRole(['Admin']), // Only admin can delete products
  validateParams(idParam),
  ctrl.remove
);
router.get('/categories', ctrl.getAvailableCategories);
// Fix stock_status for all products (admin only)
router.post('/fix-stock-status',
  checkRole(['Admin']),
  ctrl.fixStockStatus
);
module.exports = router;
