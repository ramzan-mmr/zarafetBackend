const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const ctrl = require('../controllers/promoCode.controller');
const Joi = require('joi');

// Validation schemas using Joi
const createPromoCodeSchema = Joi.object({
  code: Joi.string().min(3).max(50).required(),
  discount_type: Joi.string().valid('percentage', 'fixed').required(),
  discount_value: Joi.number().min(0.01).required(),
  status: Joi.string().valid('active', 'inactive'),
  expiry_date: Joi.date().iso().allow(null, ''),
  description: Joi.string().max(255).allow(null, '')
});

const updatePromoCodeSchema = Joi.object({
  code: Joi.string().min(3).max(50),
  discount_type: Joi.string().valid('percentage', 'fixed'),
  discount_value: Joi.number().min(0.01),
  status: Joi.string().valid('active', 'inactive'),
  expiry_date: Joi.date().iso().allow(null, ''),
  description: Joi.string().max(255).allow(null, '')
});

const validatePromoCodeSchema = Joi.object({
  code: Joi.string().required(),
  cartTotal: Joi.number().min(0).required()
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// All routes require authentication
router.use(verifyJWT);

// Admin/Manager routes
router.get('/',
  parsePagination,
  ctrl.list
);

router.get('/:id',
  validateParams(idParamSchema),
  ctrl.getById
);

router.post('/',
  checkRole(['Admin', 'Manager']),
  validateBody(createPromoCodeSchema),
  ctrl.create
);

router.put('/:id',
  checkRole(['Admin', 'Manager']),
  validateParams(idParamSchema),
  validateBody(updatePromoCodeSchema),
  ctrl.update
);

router.delete('/:id',
  checkRole(['Admin']),
  validateParams(idParamSchema),
  ctrl.remove
);

module.exports = router;
