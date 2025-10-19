const User = require('../models/User.model');
const responses = require('../utils/responses');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const users = await User.findAll(filters, { page, limit, ...req.query });
    const total = await User.count(filters);
    
    // Remove sensitive data
    users.forEach(user => delete user.password_hash);
    
    res.json(responses.ok(users, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch users'));
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(responses.notFound('User'));
    }
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json(responses.ok(user));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(responses.internalError('Failed to fetch user'));
  }
};

const create = async (req, res) => {
  try {
    const { name, email, password, role_id, status, phone, user_type = 'admin' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json(responses.conflict('User with this email already exists'));
    }
    
    const userData = {
      name,
      email,
      password,
      role_id,
      status,
      phone,
      user_type
    };
    
    const user = await User.create(userData);
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.status(201).json(responses.created(user));
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json(responses.internalError('Failed to create user'));
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json(responses.notFound('User'));
    }
    
    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findByEmail(updateData.email);
      if (emailExists) {
        return res.status(409).json(responses.conflict('User with this email already exists'));
      }
    }
    
    const user = await User.update(id, updateData);
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json(responses.ok(user));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(responses.internalError('Failed to update user'));
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(responses.notFound('User'));
    }
    
    await User.delete(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(responses.internalError('Failed to delete user'));
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
