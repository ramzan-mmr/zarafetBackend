const Joi = require('joi');

const contactForm = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().min(10).max(20).optional().allow('').messages({
    'string.min': 'Phone number must be at least 10 characters long',
    'string.max': 'Phone number must not exceed 20 characters'
  }),
  orderNumber: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'Order number must not exceed 50 characters'
  }),
  subject: Joi.string().valid('General Inquiry', 'Product Return', 'Product Exchange', 'Custom Query').required().messages({
    'any.only': 'Please select a valid subject',
    'any.required': 'Subject is required'
  }),
  message: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Message must be at least 10 characters long',
    'string.max': 'Message must not exceed 1000 characters',
    'any.required': 'Message is required'
  })
});

module.exports = {
  contactForm
};
