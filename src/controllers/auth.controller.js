const User = require('../models/User.model');
const jwt = require('../config/jwt');
const responses = require('../utils/responses');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json(responses.conflict('User with this email already exists'));
    }
    
    // Create user with default role (assuming role_id 3 is for customers)
    const userData = {
      name,
      email,
      password,
      role_id: 3, // Customer role
      phone: null // Add phone field to prevent undefined error
    };
    
    const user = await User.create(userData);
    
    // Generate token
    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role_name
    });
    
    res.status(201).json(responses.created({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name
      }
    }));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(responses.internalError('Registration failed'));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(responses.unauthorized('Invalid credentials'));
    }
    
    // Check password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json(responses.unauthorized('Invalid credentials'));
    }
    
    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(401).json(responses.unauthorized('Account is inactive'));
    }
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    // Generate token
    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role_name
    });
    
    res.json(responses.ok({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name
      }
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(responses.internalError('Login failed'));
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json(responses.notFound('User'));
    }
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json(responses.ok(user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json(responses.internalError('Failed to get user data'));
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    
    const user = await User.update(req.user.id, updateData);
    if (!user) {
      return res.status(404).json(responses.notFound('User'));
    }
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json(responses.ok(user));
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json(responses.internalError('Failed to update user data'));
  }
};

const verify = async (req, res) => {
  try {
    // This endpoint is already protected by verifyJWT middleware
    // If we reach here, the token is valid
    res.json(responses.ok({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    }));
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json(responses.internalError('Token verification failed'));
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  verify
};
