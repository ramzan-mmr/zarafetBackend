const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { listQuery, place, statusUpdate } = require('../validators/orders');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/orders.controller');

// All routes require authentication
router.use(verifyJWT);

// List and get by ID are accessible to all authenticated users
router.get('/',
  parsePagination,
  validateQuery(listQuery),
  ctrl.list
);

// Get current user's orders (for order history)
router.get('/my-orders',
  parsePagination,
  ctrl.getMyOrders
);

router.get('/:id',
  validateParams(idParam),
  ctrl.getById
);

// Place order is accessible to all authenticated users
router.post('/',
  validateBody(place),
  ctrl.place
);

// Status update and history require manager/admin role
router.put('/:id/status',
  checkRole(['Admin', 'Manager']),
  validateParams(idParam),
  validateBody(statusUpdate),
  ctrl.updateStatus
);

router.get('/:id/history',
  checkRole(['Admin', 'Manager']),
  validateParams(idParam),
  ctrl.getHistory
);

module.exports = router;
