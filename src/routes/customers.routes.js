const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { listQuery, update, addressCreate, addressUpdate } = require('../validators/customers');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/customers.controller');
// All routes require authentication and manager/admin role
router.use(verifyJWT);
router.use(checkRole(['Admin', 'Manager']));
router.get('/',
  parsePagination,
  validateQuery(listQuery),
  ctrl.list
);
router.get('/:user_id',
  validateParams({ user_id: require('joi').number().integer().positive().required() }),
  ctrl.getById
);
router.put('/:user_id',
  validateParams({ user_id: require('joi').number().integer().positive().required() }),
  validateBody(update),
  ctrl.update
);
// Address routes
router.get('/:user_id/addresses',
  validateParams({ user_id: require('joi').number().integer().positive().required() }),
  ctrl.getAddresses
);
router.post('/:user_id/addresses',
  validateParams({ user_id: require('joi').number().integer().positive().required() }),
  validateBody(addressCreate),
  ctrl.createAddress
);
router.put('/:user_id/addresses/:id',
  validateParams({ 
    user_id: require('joi').number().integer().positive().required(),
    id: require('joi').number().integer().positive().required()
  }),
  validateBody(addressUpdate),
  ctrl.updateAddress
);
router.delete('/:user_id/addresses/:id',
  validateParams({ 
    user_id: require('joi').number().integer().positive().required(),
    id: require('joi').number().integer().positive().required()
  }),
  ctrl.deleteAddress
);
module.exports = router;
