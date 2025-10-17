-- Add reason column to order_status_history table
ALTER TABLE `order_status_history` 
ADD COLUMN `reason` TEXT NULL AFTER `changed_by`;

-- Add index for better performance
ALTER TABLE `order_status_history` 
ADD INDEX `idx_reason` (`reason`(100));
