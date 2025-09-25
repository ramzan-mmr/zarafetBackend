const Joi = require('joi');
const { paginationQuery, positiveInt, money } = require('./common');

exports.listQuery = paginationQuery.keys({
  category_value_id: positiveInt,
  brand_value_id: positiveInt,
  status: Joi.string().valid('Active', 'Inactive'),
  stock_status: Joi.string().valid('Active', 'Low Stock', 'Out of Stock'),
  minPrice: money,
  maxPrice: money
});

const base = {
  sku: Joi.string().max(50).required(),
  name: Joi.string().max(180).required(),
  description: Joi.string().allow('', null),
  category_value_id: positiveInt.allow(null),
  brand_value_id: positiveInt.allow(null),
  price: money.required(),
  stock: Joi.number().integer().min(0).default(0),
  stock_status: Joi.string().valid('Active', 'Low Stock', 'Out of Stock').default('Active'),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
  images: Joi.array().items(Joi.string().uri().max(500)).default([]),
  variants: Joi.array().items(Joi.object({
    size_value_id: positiveInt.allow(null),
    color_value_id: positiveInt.allow(null),
    sku: Joi.string().max(50).allow('', null),
    extra_price: money.default(0),
    stock: Joi.number().integer().min(0).default(0)
  })).default([])
};

exports.create = Joi.object(base);
exports.update = Joi.object({
  ...base,
  sku: Joi.string().max(50) // not required in update
});
