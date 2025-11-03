const Joi = require('joi');

// Review creation schema
const createReview = Joi.object({
  product_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Product ID must be a number',
      'number.integer': 'Product ID must be an integer',
      'number.positive': 'Product ID must be positive',
      'any.required': 'Product ID is required'
    }),
  order_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order ID must be a number',
      'number.integer': 'Order ID must be an integer',
      'number.positive': 'Order ID must be positive',
      'any.required': 'Order ID is required'
    }),
  variant_id: Joi.number().integer().positive().allow(null).optional()
    .messages({
      'number.base': 'Variant ID must be a number',
      'number.integer': 'Variant ID must be an integer',
      'number.positive': 'Variant ID must be positive'
    }),
  rating: Joi.number().integer().min(1).max(5).required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5',
      'any.required': 'Rating is required'
    }),
  comment: Joi.string().max(1000).allow('')
    .messages({
      'string.max': 'Comment must not exceed 1000 characters'
    })
});

// Review update schema
const updateReview = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5',
      'any.required': 'Rating is required'
    }),
  comment: Joi.string().max(1000).allow('')
    .messages({
      'string.max': 'Comment must not exceed 1000 characters'
    })
});

// Review ID parameter schema
const reviewIdParam = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Review ID must be a number',
      'number.integer': 'Review ID must be an integer',
      'number.positive': 'Review ID must be positive',
      'any.required': 'Review ID is required'
    })
});

module.exports = {
  createReview,
  updateReview,
  reviewIdParam
};
