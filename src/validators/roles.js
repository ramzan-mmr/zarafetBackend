const Joi = require('joi');
const { paginationQuery } = require('./common');

exports.listQuery = paginationQuery;

exports.update = Joi.object({
  description: Joi.string().max(500).allow('', null),
  level: Joi.number().integer().min(1).max(5),
  status: Joi.string().valid('Active', 'Inactive')
});
