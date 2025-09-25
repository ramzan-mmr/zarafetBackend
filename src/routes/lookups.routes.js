const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { 
  headersList, headerCreate, headerUpdate,
  valuesList, valueCreate, valueUpdate 
} = require('../validators/lookups');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/lookups.controller');

// All routes require authentication and manager/admin role
router.use(verifyJWT);
router.use(checkRole(['Admin', 'Manager']));

// Header routes
router.get('/headers',
  parsePagination,
  validateQuery(headersList),
  ctrl.listHeaders
);

router.post('/headers',
  validateBody(headerCreate),
  ctrl.createHeader
);

router.put('/headers/:id',
  validateParams(idParam),
  validateBody(headerUpdate),
  ctrl.updateHeader
);

router.delete('/headers/:id',
  validateParams(idParam),
  ctrl.deleteHeader
);

// Value routes
router.get('/values',
  parsePagination,
  validateQuery(valuesList),
  ctrl.listValues
);

router.get('/values/:id',
  validateParams(idParam),
  ctrl.getValueById
);

router.post('/values',
  validateBody(valueCreate),
  ctrl.createValue
);

router.put('/values/:id',
  validateParams(idParam),
  validateBody(valueUpdate),
  ctrl.updateValue
);

router.delete('/values/:id',
  validateParams(idParam),
  ctrl.deleteValue
);

module.exports = router;
