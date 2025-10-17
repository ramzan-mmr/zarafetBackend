const Joi = require('joi');

// Send OTP validation
exports.sendOTP = Joi.object({
  email: Joi.string().email().required()
});

// Verify OTP validation
exports.verifyOTP = Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required()
});

// Resend OTP validation
exports.resendOTP = Joi.object({
  email: Joi.string().email().required()
});
