-- Migration: Create categories table with image support
-- Date: 2025-01-04

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL COMMENT 'For hierarchical categories',
  `sort_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `parent_id` (`parent_id`),
  KEY `status` (`status`),
  KEY `sort_order` (`sort_order`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `categories_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert some sample categories
INSERT INTO `categories` (`code`, `name`, `description`, `status`, `sort_order`, `created_by`) VALUES
('CAT-001', 'Women', 'Women\'s clothing and accessories', 'Active', 1, 1),
('CAT-002', 'Men', 'Men\'s clothing and accessories', 'Active', 2, 1),
('CAT-003', 'Children', 'Children\'s clothing and accessories', 'Active', 3, 1),
('CAT-004', 'Abayas', 'Traditional abayas for women', 'Active', 1, 1),
('CAT-005', 'Dresses', 'Women\'s dresses', 'Active', 2, 1);

-- Update parent relationships
UPDATE `categories` SET `parent_id` = 1 WHERE `code` = 'CAT-004';
UPDATE `categories` SET `parent_id` = 1 WHERE `code` = 'CAT-005';
