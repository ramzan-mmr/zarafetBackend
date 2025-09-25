const Role = require('../models/Role.model');
const responses = require('../utils/responses');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const roles = await Role.findAll(filters, { page, limit, ...req.query });
    const total = await Role.count(filters);
    
    res.json(responses.ok(roles, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Roles list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch roles'));
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json(responses.notFound('Role'));
    }
    
    const role = await Role.update(id, updateData);
    
    res.json(responses.ok(role));
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json(responses.internalError('Failed to update role'));
  }
};

module.exports = {
  list,
  update
};
