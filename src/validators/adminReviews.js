const Joi = require('joi');

const status = Joi.string().valid('Active', 'Inactive');

const createManualReview = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  reviewer_name: Joi.string().trim().min(2).max(120).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).allow('', null),
  review_date: Joi.date().iso().required(),
  status: status.default('Active')
});

const updateManualReview = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  reviewer_name: Joi.string().trim().min(2).max(120).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).allow('', null),
  review_date: Joi.date().iso().required(),
  status: status.required()
});

const listManualReviews = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null),
  product_id: Joi.number().integer().positive().allow('', null),
  status: status.allow('', null),
  source: Joi.string().valid('manual', 'real').allow('', null),
  sortBy: Joi.string().valid('created_at', 'rating', 'reviewer_name', 'product_name', 'status', 'source').default('created_at'),
  sortDir: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createManualReview,
  updateManualReview,
  listManualReviews
};
