const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { listQuery, create, update } = require('../validators/users');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/users.controller');
// All routes require authentication and manager/admin role
router.use(verifyJWT);
router.use(checkRole(['Admin', 'Manager']));
router.get('/',
  parsePagination,
  validateQuery(listQuery),
  ctrl.list
);
router.get('/:id',
  validateParams(idParam),
  ctrl.getById
);
router.post('/',
  validateBody(create),
  ctrl.create
);
router.put('/:id',
  validateParams(idParam),
  validateBody(update),
  ctrl.update
);
router.delete('/:id',
  validateParams(idParam),
  checkRole(['Admin']), // Only admin can delete users
  ctrl.remove
);
module.exports = router;
