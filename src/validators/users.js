const Joi = require('joi');
const { paginationQuery, positiveInt } = require('./common');

exports.listQuery = paginationQuery.keys({
  status: Joi.string().valid('Active', 'Inactive'),
  role_id: positiveInt
});

exports.create = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  role_id: positiveInt.required(),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
  phone: Joi.string().max(30).allow(null, ''),
  user_type: Joi.string().valid('admin', 'customer').default('admin')
});

exports.update = Joi.object({
  name: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(64),
  role_id: positiveInt,
  status: Joi.string().valid('Active', 'Inactive'),
  phone: Joi.string().max(30).allow(null, ''),
  user_type: Joi.string().valid('admin', 'customer')
});
