const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { listQuery, update } = require('../validators/roles');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/roles.controller');

// All routes require authentication and admin role
router.use(verifyJWT);
router.use(checkRole(['Admin']));

router.get('/',
  parsePagination,
  validateQuery(listQuery),
  ctrl.list
);

router.put('/:id',
  validateParams(idParam),
  validateBody(update),
  ctrl.update
);

module.exports = router;
