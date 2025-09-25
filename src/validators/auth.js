const Joi = require('joi');

exports.register = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required()
});

exports.login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required()
});

exports.updateMe = Joi.object({
  name: Joi.string().min(2).max(120),
  phone: Joi.string().max(30)
});
