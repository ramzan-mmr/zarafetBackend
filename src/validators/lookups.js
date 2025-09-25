const Joi = require('joi');
const { paginationQuery, positiveInt } = require('./common');

exports.headersList = paginationQuery.keys({
  category: Joi.string().valid('Product', 'Order', 'Payment', 'Location', 'Customer', 'Promotion'),
  status: Joi.string().valid('Active', 'Inactive'),
  type: Joi.string().valid('System', 'Custom')
});

exports.headerCreate = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string().valid('Product', 'Order', 'Payment', 'Location', 'Customer', 'Promotion'),
  type: Joi.string().valid('System', 'Custom').default('Custom'),
  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

exports.headerUpdate = Joi.object({
  name: Joi.string().min(2).max(120),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string().valid('Product', 'Order', 'Payment', 'Location', 'Customer', 'Promotion'),
  type: Joi.string().valid('System', 'Custom'),
  status: Joi.string().valid('Active', 'Inactive')
});

exports.valuesList = paginationQuery.keys({
  header_id: positiveInt.required(),
  status: Joi.string().valid('Active', 'Inactive')
});

exports.valueCreate = Joi.object({
  header_id: positiveInt.required(),
  value: Joi.string().min(1).max(150).required(),
  description: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
  order: Joi.number().integer().min(1).default(1),
  parent_value_id: positiveInt.allow(null)
});

exports.valueUpdate = Joi.object({
  value: Joi.string().min(1).max(150),
  description: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('Active', 'Inactive'),
  order: Joi.number().integer().min(1),
  parent_value_id: positiveInt.allow(null)
});
