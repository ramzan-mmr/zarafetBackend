const db = require('../config/db');

class OTP {
  // Generate a 6-digit OTP code
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create OTP verification record
  static async create(userId, email) {
    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const [result] = await db.execute(
      'INSERT INTO otp_verifications (user_id, email, otp_code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, email, otpCode, expiresAt]
    );

    return {
      id: result.insertId,
      otpCode,
      expiresAt
    };
  }

  // Verify OTP code
  static async verify(email, otpCode) {
    const [rows] = await db.execute(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp_code = ? AND is_used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, otpCode]
    );

    if (rows.length === 0) {
      return { valid: false, message: 'Invalid or expired OTP code' };
    }

    const otpRecord = rows[0];

    // Mark OTP as used
    await db.execute(
      'UPDATE otp_verifications SET is_used = 1 WHERE id = ?',
      [otpRecord.id]
    );

    // Update user email verification status
    await db.execute(
      'UPDATE users SET email_verified = 1, email_verified_at = NOW() WHERE id = ?',
      [otpRecord.user_id]
    );

    return { valid: true, userId: otpRecord.user_id };
  }

  // Get latest OTP for user
  static async getLatestOTP(email) {
    const [rows] = await db.execute(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND is_used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // Clean up expired OTPs
  static async cleanupExpired() {
    await db.execute(
      'DELETE FROM otp_verifications WHERE expires_at < NOW()'
    );
  }

  // Resend OTP (invalidate old ones and create new)
  static async resend(userId, email) {
    // Mark all existing OTPs for this user as used
    await db.execute(
      'UPDATE otp_verifications SET is_used = 1 WHERE user_id = ? AND email = ?',
      [userId, email]
    );

    // Create new OTP
    return await this.create(userId, email);
  }
}

module.exports = OTP;
