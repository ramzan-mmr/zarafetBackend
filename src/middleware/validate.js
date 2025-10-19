const Joi = require('joi');
const responses = require('../utils/responses');

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { 
    abortEarly: false, 
    stripUnknown: true 
  });

  console.log(error);
  if (error) {
    const details = error.details.map(d => ({
      path: d.path.join('.'),
      type: d.type,
      message: d.message
    }));
    
    return res.status(400).json(responses.validationError(details));
  }
  
  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { 
    abortEarly: false, 
    stripUnknown: true 
  });
  
  if (error) {
    const details = error.details.map(d => ({
      path: d.path.join('.'),
      type: d.type,
      message: d.message
    }));
    
    return res.status(400).json(responses.validationError(details));
  }
  
  req.query = value;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, { 
    abortEarly: false, 
    stripUnknown: true 
  });
  
  if (error) {
    const details = error.details.map(d => ({
      path: d.path.join('.'),
      type: d.type,
      message: d.message
    }));
    
    return res.status(400).json(responses.validationError(details));
  }
  
  req.params = value;
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
