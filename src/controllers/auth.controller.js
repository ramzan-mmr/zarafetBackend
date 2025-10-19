const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const jwt = require('../config/jwt');
const responses = require('../utils/responses');
const { sendPasswordResetEmail } = require('../services/email.service');
const db = require('../config/db');

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

    // Find ADMIN user specifically using user_type
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.status = 'Active' AND u.user_type = 'admin'
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json(responses.unauthorized('Invalid credentials'));
    }

    // Use the admin user
    const user = users[0];

    // Check password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json(responses.unauthorized('Invalid credentials'));
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
        role_name: user.role_name
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

// Forgot password for admin users
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(responses.badRequest('Email is required'));
    }

    // Find ADMIN user specifically using user_type
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.status = 'Active' AND u.user_type = 'admin'
    `, [email]);

    if (users.length === 0) {
      return res.status(404).json(responses.notFound('Admin account not found'));
    }

    // Use the admin user
    const user = users[0];

    // Create and send password reset OTP
    const otpData = await OTP.create(user.id, email);
    await sendPasswordResetEmail(user, otpData.otpCode);

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      otpExpiresAt: otpData.expiresAt
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(responses.internalError('Failed to send password reset code'));
  }
};

// Reset password for admin users
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json(responses.badRequest('Email, OTP, and new password are required'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(responses.badRequest('Password must be at least 6 characters long'));
    }

    // Verify OTP
    const result = await OTP.verify(email, otp);
    if (!result.valid) {
      return res.status(400).json(responses.badRequest(result.message));
    }

    // Find ADMIN user specifically using user_type
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.status = 'Active' AND u.user_type = 'admin'
    `, [email]);

    if (users.length === 0) {
      return res.status(404).json(responses.notFound('Admin account not found'));
    }

    // Use the admin user
    const user = users[0];

    // Update password
    await User.updatePassword(user.id, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};
module.exports = {
  register,
  login,
  getMe,
  updateMe,
  verify,
  forgotPassword,
  resetPassword
};
