const Joi = require('joi');
const { paginationQuery, positiveInt, money } = require('./common');

exports.listQuery = paginationQuery.keys({
  category_value_id: positiveInt,
  status: Joi.string().valid('Active', 'Inactive').allow('', null),
  stock_status: Joi.string().valid('Active', 'Low Stock', 'Out of Stock').allow('', null),
  minPrice: money.allow('', null),
  maxPrice: money.allow('', null)
});

const base = {
  // SKU is now auto-generated from product name, no longer required
  name: Joi.string().max(180).required(),
  description: Joi.string().allow('', null),
  category_value_id: positiveInt.allow(null),
  price: money.required(),
  original_price: money.allow(null),
  current_price: money.allow(null),
  stock: Joi.number().integer().min(0).default(0),
  stock_status: Joi.string().valid('Active', 'Low Stock', 'Out of Stock').default('Active'),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
  // Fit selection fields
  fit_required: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number().integer().valid(0, 1)
  ).default(false),
  default_fit: Joi.string().max(50).allow('', null),
  fit_options: Joi.string().allow('', null), // JSON string of selected fit options
  // Product information sections
  materials_care: Joi.string().allow('', null).description('Materials and care instructions'),
  delivery_returns: Joi.string().allow('', null).description('Delivery and returns information'),
  return_exchanges: Joi.string().allow('', null).description('Return and exchange policy information'),
  contact_info: Joi.string().allow('', null).description('Contact information for product support'),
  images: Joi.array().items(Joi.string().max(10000000)).default([]), // Increased to 10MB for base64 images
  variants: Joi.array().items(Joi.object({
    size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL').allow(null),
    color_name: Joi.string().max(100).allow('', null),
    color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).description('Hex color code like #FF5733'),
    color_image: Joi.string().max(10000000).allow('', null).description('Optional color swatch image URL or base64 data'),
    sku: Joi.string().max(50).allow('', null),
    extra_price: money.default(0),
    stock: Joi.number().integer().min(0).default(0)
  })).default([])
};

exports.create = Joi.object(base);
exports.update = Joi.object({
  ...base
  // SKU is auto-generated, not required in update
});
