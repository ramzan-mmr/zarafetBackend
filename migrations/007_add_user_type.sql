-- Add user_type field to users table
-- This will help distinguish between admin and customer users more explicitly

ALTER TABLE `users` 
ADD COLUMN `user_type` ENUM('admin', 'customer') NOT NULL DEFAULT 'customer' AFTER `role_id`;

-- Update existing users based on their roles
UPDATE `users` 
SET `user_type` = 'admin' 
WHERE `role_id` IN (1, 2, 3); -- Super_Admin, Admin, Manager roles

UPDATE `users` 
SET `user_type` = 'customer' 
WHERE `role_id` = 4; -- Customer role

-- Add index for better performance
ALTER TABLE `users` 
ADD INDEX `idx_user_type` (`user_type`);

-- Add composite index for email + user_type lookups
ALTER TABLE `users` 
ADD INDEX `idx_email_user_type` (`email`, `user_type`);
