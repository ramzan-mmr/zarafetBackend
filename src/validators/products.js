const Joi = require('joi');
const { paginationQuery, positiveInt, money } = require('./common');

exports.listQuery = paginationQuery.keys({
  category_value_id: positiveInt,
  status: Joi.string().valid('Active', 'Inactive'),
  stock_status: Joi.string().valid('Active', 'Low Stock', 'Out of Stock'),
  minPrice: money,
  maxPrice: money
});

const base = {
  sku: Joi.string().max(50).allow('', null),
  name: Joi.string().max(180).required(),
  description: Joi.string().allow('', null),
  category_value_id: positiveInt.allow(null),
  price: money.required(),
  original_price: money.allow(null),
  current_price: money.allow(null),
  stock: Joi.number().integer().min(0).default(0),
  stock_status: Joi.string().valid('Active', 'Low Stock', 'Out of Stock').default('Active'),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
  images: Joi.array().items(Joi.string().max(1000000)).default([]),
  variants: Joi.array().items(Joi.object({
    size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL').allow(null),
    color_name: Joi.string().max(100).allow('', null),
    color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).description('Hex color code like #FF5733'),
    color_image: Joi.string().max(1000000).allow('', null).description('Optional color swatch image URL or base64 data'),
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
