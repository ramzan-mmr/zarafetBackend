const Joi = require('joi');
const { paginationQuery, positiveInt } = require('./common');

exports.listQuery = paginationQuery.keys({
  status: Joi.string().valid('Active', 'Inactive'),
  tier_value_id: positiveInt,
  minOrders: Joi.number().integer().min(0),
  maxOrders: Joi.number().integer().min(0),
  minSpend: Joi.number().precision(2).min(0),
  maxSpend: Joi.number().precision(2).min(0)
});

exports.update = Joi.object({
  name: Joi.string().min(2).max(120),
  phone: Joi.string().max(30),
  status: Joi.string().valid('Active', 'Inactive'),
  tier_value_id: positiveInt.allow(null)
});

exports.addressCreate = Joi.object({
  label: Joi.string().valid('HOME', 'OFFICE').default('HOME'),
  line1: Joi.string().max(150).required(),
  line2: Joi.string().max(150).allow('', null),
  city_value_id: positiveInt.allow(null),
  postal_code: Joi.string().max(20).allow('', null),
  phone: Joi.string().max(30).allow('', null),
  is_default: Joi.boolean().default(false)
});

exports.addressUpdate = Joi.object({
  label: Joi.string().valid('HOME', 'OFFICE'),
  line1: Joi.string().max(150),
  line2: Joi.string().max(150).allow('', null),
  city_value_id: positiveInt.allow(null),
  postal_code: Joi.string().max(20).allow('', null),
  phone: Joi.string().max(30).allow('', null),
  is_default: Joi.boolean()
});
