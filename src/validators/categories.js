const Joi = require('joi');
const { paginationQuery, positiveInt } = require('./common');

// Category creation validation
const createCategory = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(1000).allow('', null),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
  parent_id: Joi.number().integer().positive().allow(null),
  sort_order: Joi.number().integer().min(1).default(1)
});

// Category update validation
const updateCategory = Joi.object({
  name: Joi.string().min(2).max(120),
  description: Joi.string().max(1000).allow('', null),
  status: Joi.string().valid('Active', 'Inactive'),
  parent_id: Joi.number().integer().positive().allow(null),
  sort_order: Joi.number().integer().min(1)
});

// Category ID validation
const categoryId = Joi.object({
  id: positiveInt.required()
});

// Query validation for listing
const listQuery = paginationQuery.keys({
  status: Joi.string().valid('Active', 'Inactive')
});

// Public category query validation
const publicCategoryQuery = Joi.object({
  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

module.exports = {
  createCategory,
  updateCategory,
  categoryId,
  listQuery,
  publicCategoryQuery
};
