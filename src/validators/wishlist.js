const Joi = require('joi');
const { positiveInt } = require('./common');

exports.add = Joi.object({ 
  product_id: positiveInt.required() 
});

exports.productIdParam = Joi.object({ 
  product_id: positiveInt.required() 
});