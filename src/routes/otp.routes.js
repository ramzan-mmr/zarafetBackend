const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otp.controller');
// Send OTP for email verification
router.post('/send', sendOTP);
// Verify OTP
router.post('/verify', verifyOTP);
// Resend OTP
router.post('/resend', resendOTP);
module.exports = router;
