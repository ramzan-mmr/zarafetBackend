const Joi = require('joi');

// Customer signup validation
exports.customerSignup = Joi.object({
  name: Joi.string().min(2).max(120).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 120 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).max(64).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 64 characters',
    'any.required': 'Password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Password and confirm password must match',
    'any.required': 'Confirm password is required'
  })
});

// Customer login validation
exports.customerLogin = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Address validation schemas
exports.addressCreate = Joi.object({
  label: Joi.string().max(50).default('Home').messages({
    'string.max': 'Label must not exceed 50 characters'
  }),
  line1: Joi.string().max(150).required().messages({
    'string.max': 'Address line 1 must not exceed 150 characters',
    'any.required': 'Address line 1 is required'
  }),
  line2: Joi.string().max(150).allow(null, '').messages({
    'string.max': 'Address line 2 must not exceed 150 characters'
  }),
  city_value_id: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'City must be a valid number',
    'number.positive': 'City must be a positive number'
  }),
  postal_code: Joi.string().max(20).allow(null, '').messages({
    'string.max': 'Postal code must not exceed 20 characters'
  }),
  phone: Joi.string().max(30).allow(null, '').messages({
    'string.max': 'Phone must not exceed 30 characters'
  }),
  is_default: Joi.boolean().default(false).messages({
    'boolean.base': 'is_default must be a boolean value'
  })
});

exports.addressUpdate = Joi.object({
  label: Joi.string().max(50).messages({
    'string.max': 'Label must not exceed 50 characters'
  }),
  line1: Joi.string().max(150).messages({
    'string.max': 'Address line 1 must not exceed 150 characters'
  }),
  line2: Joi.string().max(150).allow(null, '').messages({
    'string.max': 'Address line 2 must not exceed 150 characters'
  }),
  city_value_id: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'City must be a valid number',
    'number.positive': 'City must be a positive number'
  }),
  postal_code: Joi.string().max(20).allow(null, '').messages({
    'string.max': 'Postal code must not exceed 20 characters'
  }),
  phone: Joi.string().max(30).allow(null, '').messages({
    'string.max': 'Phone must not exceed 30 characters'
  }),
  is_default: Joi.boolean().messages({
    'boolean.base': 'is_default must be a boolean value'
  })
});