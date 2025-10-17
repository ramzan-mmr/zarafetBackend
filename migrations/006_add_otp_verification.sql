-- Add OTP verification system
-- Create OTP table for storing verification codes

CREATE TABLE `otp_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `email` (`email`),
  KEY `otp_code` (`otp_code`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add email_verified column to users table
ALTER TABLE `users` 
ADD COLUMN `email_verified` tinyint(1) DEFAULT 0 AFTER `email`,
ADD COLUMN `email_verified_at` datetime DEFAULT NULL AFTER `email_verified`;
