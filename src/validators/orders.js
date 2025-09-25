const Joi = require('joi');
const { paginationQuery, positiveInt, money } = require('./common');

exports.listQuery = paginationQuery.keys({
  status_value_id: positiveInt,
  payment_method_value_id: positiveInt
});

exports.place = Joi.object({
  items: Joi.array().items(Joi.object({
    product_id: positiveInt.required(),
    variant_id: positiveInt.allow(null),
    quantity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  address_id: positiveInt.required(),
  shipment: Joi.object({
    method_value_id: positiveInt.allow(null),
    scheduled_date: Joi.date().iso().allow(null)
  }).default({}),
  payment_method_value_id: positiveInt.allow(null),
  discount_type_value_id: positiveInt.allow(null),
  notes: Joi.string().max(500).allow('', null)
});

exports.statusUpdate = Joi.object({
  to_status_value_id: positiveInt.required()
});
