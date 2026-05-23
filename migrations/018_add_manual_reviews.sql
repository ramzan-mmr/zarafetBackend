ALTER TABLE `reviews`
  MODIFY COLUMN `user_id` int(11) NULL,
  MODIFY COLUMN `order_id` int(11) NULL,
  ADD COLUMN `reviewer_name` varchar(120) DEFAULT NULL AFTER `order_id`,
  ADD COLUMN `source` enum('real','manual') NOT NULL DEFAULT 'real' AFTER `status`,
  ADD INDEX `idx_reviews_source` (`source`),
  ADD INDEX `idx_reviews_product_source_status` (`product_id`, `source`, `status`);
