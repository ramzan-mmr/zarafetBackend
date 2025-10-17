const OTP = require('../models/OTP.model');
const User = require('../models/User.model');
const { sendOTPVerificationEmail } = require('../services/email.service');
const responses = require('../utils/responses');

// Send OTP for email verification
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Simple validation
    if (!email) {
      return res.status(400).json(responses.badRequest('Email is required'));
    }

    if (!email.includes('@')) {
      return res.status(400).json(responses.badRequest('Invalid email format'));
    }

    // Check if user exists and is not verified
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json(responses.notFound('User not found'));
    }

    if (user.email_verified) {
      return res.status(400).json(responses.badRequest('Email already verified'));
    }

    // Create OTP
    const otpData = await OTP.create(user.id, email);

    // Send OTP email
    await sendOTPVerificationEmail(user, otpData.otpCode);

    res.json(responses.ok({
      message: 'OTP sent successfully',
      expiresAt: otpData.expiresAt
    }));

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json(responses.internalError('Failed to send OTP'));
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Simple validation
    if (!email || !otpCode) {
      return res.status(400).json(responses.badRequest('Email and OTP code are required'));
    }

    if (!email.includes('@')) {
      return res.status(400).json(responses.badRequest('Invalid email format'));
    }

    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      return res.status(400).json(responses.badRequest('OTP code must be 6 digits'));
    }

    // Verify OTP
    const result = await OTP.verify(email, otpCode);

    if (!result.valid) {
      return res.status(400).json(responses.badRequest(result.message));
    }

    // Get updated user data
    const user = await User.findById(result.userId);

    res.json(responses.ok({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified
      }
    }));

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json(responses.internalError('Failed to verify OTP'));
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Simple validation
    if (!email) {
      return res.status(400).json(responses.badRequest('Email is required'));
    }

    if (!email.includes('@')) {
      return res.status(400).json(responses.badRequest('Invalid email format'));
    }

    // Check if user exists and is not verified
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json(responses.notFound('User not found'));
    }

    if (user.email_verified) {
      return res.status(400).json(responses.badRequest('Email already verified'));
    }

    // Resend OTP
    const otpData = await OTP.resend(user.id, email);

    // Send OTP email
    await sendOTPVerificationEmail(user, otpData.otpCode);

    res.json(responses.ok({
      message: 'OTP resent successfully',
      expiresAt: otpData.expiresAt
    }));

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json(responses.internalError('Failed to resend OTP'));
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};
