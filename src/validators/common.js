const Joi = require('joi');

exports.paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'price', 'stock', 'date_added', 'total', 'last_login_at'),
  sortDir: Joi.string().valid('asc', 'desc').default('asc'),
  search: Joi.string().trim().allow('', null),
  from: Joi.date().iso(),
  to: Joi.date().iso()
}).unknown(false);

exports.idParam = Joi.object({ 
  id: Joi.number().integer().positive().required() 
});

exports.uuidOrCode = Joi.string().max(30);
exports.positiveInt = Joi.number().integer().positive();
exports.money = Joi.number().precision(2).min(0);
