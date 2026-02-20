-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 20, 2026 at 05:06 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `zarafet_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT 'Home',
  `line1` varchar(150) NOT NULL,
  `line2` varchar(150) DEFAULT NULL,
  `city` varchar(100) NOT NULL DEFAULT '',
  `postal_code` varchar(20) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `label`, `line1`, `line2`, `city`, `postal_code`, `phone`, `is_default`) VALUES
(3, 5, 'HOME', '123 Main Street', 'Apt 4B', '', '12345', '+1234567890', 0),
(11, 6, 'asdfa', '2342', '234', 'asdfad', '23423', '234234234', 0),
(12, 5, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', 1),
(13, 8, 'tesetign ', '23423', '234234', 'asdfad', '123123', '0398384723', 1),
(14, 5, 'alsdkf', '234234', '', '234234', '234234', '03048796763', 0);

-- --------------------------------------------------------

--
-- Table structure for table `applied_discounts`
--

CREATE TABLE `applied_discounts` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `discount_type_value_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL COMMENT 'For hierarchical categories',
  `sort_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `code`, `name`, `description`, `image_url`, `parent_id`, `sort_order`, `status`, `created_at`, `updated_at`, `created_by`) VALUES
(6, 'CAT-00006', 'Abayas', 'Traditional Islamic garments for women', 'http://localhost:3000/uploads/categories/category-1760212975097-502653228.png', NULL, 2, 'Active', '2025-10-08 22:07:30', '2025-10-12 01:02:55', 1),
(7, 'CAT-00007', 'babies', 'Clothing and accessories for infants and babies', 'http://localhost:3000/uploads/categories/category-1760212982143-303527305.png', NULL, 3, 'Active', '2025-10-08 22:07:30', '2025-10-12 01:03:02', 1),
(8, 'CAT-00008', 'children', 'Clothing and accessories for children', 'http://localhost:3000/uploads/categories/category-1760212992056-889152549.png', NULL, 4, 'Active', '2025-10-08 22:07:30', '2025-10-12 01:03:12', 1),
(9, 'CAT-00009', 'Dresses', 'Various styles of dresses for women', 'http://localhost:3000/uploads/categories/category-1760212999146-864432269.png', NULL, 5, 'Active', '2025-10-08 22:07:30', '2025-10-12 01:03:19', 1),
(10, 'CAT-00010', 'women', 'General category for women\'s apparel and accessories', 'http://localhost:3000/uploads/categories/category-1760213006638-717340176.png', NULL, 6, 'Active', '2025-10-08 22:07:30', '2025-10-12 01:03:26', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer_profiles`
--

CREATE TABLE `customer_profiles` (
  `user_id` int(11) NOT NULL,
  `total_orders` int(11) DEFAULT 0,
  `total_spend` decimal(12,2) DEFAULT 0.00,
  `points` int(11) DEFAULT 0,
  `tier_value_id` int(11) DEFAULT NULL,
  `reg_date` date DEFAULT curdate(),
  `last_order_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_profiles`
--

INSERT INTO `customer_profiles` (`user_id`, `total_orders`, `total_spend`, `points`, `tier_value_id`, `reg_date`, `last_order_at`) VALUES
(2, 0, 0.00, 0, NULL, '2025-10-02', NULL),
(3, 0, 0.00, 0, NULL, '2025-10-02', NULL),
(5, 0, 0.00, 0, NULL, '2025-10-03', NULL),
(6, 0, 0.00, 0, NULL, '2025-10-07', NULL),
(7, 0, 0.00, 0, NULL, '2025-10-17', NULL),
(8, 0, 0.00, 0, NULL, '2025-10-17', NULL),
(10, 0, 0.00, 0, NULL, '2025-10-18', NULL),
(11, 0, 0.00, 0, NULL, '2025-10-18', NULL),
(15, 0, 0.00, 0, NULL, '2025-10-22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lookup_headers`
--

CREATE TABLE `lookup_headers` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(60) DEFAULT NULL,
  `type` enum('System','Custom') DEFAULT 'Custom',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lookup_headers`
--

INSERT INTO `lookup_headers` (`id`, `code`, `name`, `description`, `category`, `type`, `status`, `created_at`) VALUES
(8, 'LH-00008', 'Product Category', 'Product Category', NULL, 'Custom', 'Active', '2025-09-28 23:24:34'),
(20, 'LH-00009', 'Order Status', 'Order status values', NULL, 'Custom', 'Active', '2025-10-12 04:57:51'),
(21, 'LH-00010', 'Product Fit', 'Available fit options for clothing products', NULL, 'Custom', 'Active', '2025-10-27 15:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `lookup_values`
--

CREATE TABLE `lookup_values` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `header_id` int(11) NOT NULL,
  `value` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `order` int(11) DEFAULT 1,
  `parent_value_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lookup_values`
--

INSERT INTO `lookup_values` (`id`, `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`) VALUES
(3, 'LV-00003', 8, 'Abayas ', 'Abayas ', 'Active', 1, NULL, '2025-09-28 23:25:07', 1),
(4, 'LV-00004', 8, 'Dresses ', 'Dresses ', 'Active', 1, NULL, '2025-09-28 23:25:25', 1),
(5, 'LV-00005', 8, 'women', 'WOMEN ', 'Active', 1, NULL, '2025-09-28 23:26:39', 1),
(6, 'LV-00006', 8, 'babies', 'babies', 'Active', 1, NULL, '2025-09-28 23:26:56', 1),
(7, 'LV-00007', 8, 'children', 'children', 'Active', 1, NULL, '2025-09-28 23:27:20', 1),
(27, 'LV-00027', 20, 'Pending', 'Order is pending', 'Active', 1, NULL, '2025-10-12 04:57:51', 1),
(28, 'LV-00028', 20, 'Processing', 'Order is being processed', 'Active', 2, NULL, '2025-10-17 23:00:03', 1),
(29, 'LV-00029', 20, 'Shipped', 'Order has been shipped', 'Active', 3, NULL, '2025-10-17 23:00:03', 1),
(30, 'LV-00030', 20, 'Delivered', 'Order has been delivered', 'Active', 4, NULL, '2025-10-17 23:00:03', 1),
(31, 'LV-00031', 20, 'Cancelled', 'Order has been cancelled', 'Active', 5, NULL, '2025-10-17 23:00:03', 1),
(33, 'LV-00033', 20, 'Returned', 'Order has been returned', 'Inactive', 7, NULL, '2025-10-17 23:00:03', 1),
(34, NULL, 21, 'Standard Fit', 'Regular standard fit', 'Active', 1, NULL, '2025-10-27 15:13:45', NULL),
(35, NULL, 21, 'Slim Fit', 'Tighter, more fitted silhouette', 'Active', 1, NULL, '2025-10-27 15:13:45', NULL),
(36, NULL, 21, 'Loose Fit', 'Relaxed, comfortable fit', 'Active', 1, NULL, '2025-10-27 15:13:45', NULL),
(37, NULL, 21, 'Oversized', 'Larger, relaxed fit', 'Active', 1, NULL, '2025-10-27 15:13:45', NULL),
(38, NULL, 21, 'Fitted', 'Close to body fit', 'Active', 1, NULL, '2025-10-27 15:13:45', NULL),
(39, NULL, 21, 'Relaxed Fit', 'Comfortable, not tight', 'Active', 1, NULL, '2025-10-27 15:13:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `status_value_id` int(11) NOT NULL,
  `payment_method_value_id` int(11) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) DEFAULT 0.00,
  `shipping` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `payment_id` int(11) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `promo_code_id` int(11) DEFAULT NULL,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `promo_code_used` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `code`, `user_id`, `status_value_id`, `payment_method_value_id`, `subtotal`, `tax`, `shipping`, `total`, `created_at`, `payment_id`, `payment_status`, `promo_code_id`, `discount_amount`, `promo_code_used`) VALUES
(35, 'ORD-00035', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 15:56:50', 37, 'paid', NULL, 0.00, NULL),
(36, 'ORD-00036', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 16:02:32', 38, 'paid', NULL, 0.00, NULL),
(37, 'ORD-00037', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 16:06:19', 39, 'paid', NULL, 0.00, NULL),
(38, 'ORD-00038', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 16:07:30', 40, 'paid', NULL, 0.00, NULL),
(39, 'ORD-00039', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 16:08:32', 41, 'paid', NULL, 0.00, NULL),
(40, 'ORD-00040', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 16:09:36', 42, 'paid', NULL, 0.00, NULL),
(41, 'ORD-00041', 5, 27, NULL, 12.00, 1.20, 5.00, 17.00, '2025-10-25 16:10:09', 43, 'paid', NULL, 0.00, NULL),
(42, 'ORD-00042', 5, 27, NULL, 268.00, 26.80, 0.00, 268.00, '2025-10-27 16:37:11', 44, 'paid', NULL, 0.00, NULL),
(43, 'ORD-00043', 5, 27, NULL, 268.00, 26.80, 0.00, 151.00, '2025-10-28 12:32:29', 45, 'paid', NULL, 117.00, 'TEST'),
(44, 'ORD-00044', 5, 27, NULL, 268.00, 26.80, 0.00, 151.00, '2025-10-28 12:52:19', 46, 'paid', NULL, 117.00, 'TEST'),
(45, 'ORD-00045', 5, 27, NULL, 268.00, 26.80, 0.00, 151.00, '2025-10-28 12:55:30', 47, 'paid', NULL, 117.00, 'TEST'),
(46, 'ORD-00046', 5, 27, NULL, 268.00, 26.80, 0.00, 268.00, '2025-10-28 12:57:35', 48, 'paid', NULL, 0.00, NULL),
(47, 'ORD-00047', 5, 27, NULL, 311.00, 31.10, 0.00, 182.50, '2025-10-28 15:27:10', 49, 'paid', NULL, 128.50, 'TEST');

-- --------------------------------------------------------

--
-- Table structure for table `order_addresses`
--

CREATE TABLE `order_addresses` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `line1` varchar(150) NOT NULL,
  `line2` varchar(150) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_addresses`
--

INSERT INTO `order_addresses` (`id`, `order_id`, `label`, `line1`, `line2`, `city`, `postal_code`, `phone`, `created_at`) VALUES
(33, 35, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 15:56:50'),
(34, 36, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 16:02:32'),
(35, 37, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 16:06:19'),
(36, 38, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 16:07:30'),
(37, 39, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 16:08:32'),
(38, 40, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 16:09:36'),
(39, 41, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-25 16:10:09'),
(40, 42, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-27 16:37:11'),
(41, 43, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-28 12:32:29'),
(42, 44, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-28 12:52:19'),
(43, 45, 'alsdkf', '234234', '', '234234', '234234', '03048796763', '2025-10-28 12:55:30'),
(44, 46, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-28 12:57:35'),
(45, 47, 'Testing address', 'asdfasd', 'asdfasd', 'asdfad', '23423', '093847823423', '2025-10-28 15:27:10');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `quantity`, `unit_price`) VALUES
(37, 35, 21, 55, 1, 12.00),
(38, 36, 21, 55, 1, 12.00),
(39, 37, 21, 55, 1, 12.00),
(40, 38, 21, 55, 1, 12.00),
(41, 39, 21, 55, 1, 12.00),
(42, 40, 21, 55, 1, 12.00),
(43, 41, 21, 55, 1, 12.00),
(44, 42, 20, 56, 1, 268.00),
(45, 43, 20, 56, 1, 268.00),
(46, 44, 20, 56, 1, 268.00),
(47, 45, 20, 56, 1, 268.00),
(48, 46, 20, 56, 1, 268.00),
(49, 47, 19, 69, 1, 43.00),
(50, 47, 20, 56, 1, 268.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `from_status_value_id` int(11) DEFAULT NULL,
  `to_status_value_id` int(11) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `changed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `from_status_value_id`, `to_status_value_id`, `changed_by`, `reason`, `changed_at`) VALUES
(43, 35, NULL, 27, 5, NULL, '2025-10-25 15:56:50'),
(44, 36, NULL, 27, 5, NULL, '2025-10-25 16:02:32'),
(45, 37, NULL, 27, 5, NULL, '2025-10-25 16:06:19'),
(46, 38, NULL, 27, 5, NULL, '2025-10-25 16:07:30'),
(47, 39, NULL, 27, 5, NULL, '2025-10-25 16:08:32'),
(48, 40, NULL, 27, 5, NULL, '2025-10-25 16:09:36'),
(49, 41, NULL, 27, 5, NULL, '2025-10-25 16:10:09'),
(50, 42, NULL, 27, 5, NULL, '2025-10-27 16:37:11'),
(51, 43, NULL, 27, 5, NULL, '2025-10-28 12:32:29'),
(52, 44, NULL, 27, 5, NULL, '2025-10-28 12:52:19'),
(53, 45, NULL, 27, 5, NULL, '2025-10-28 12:55:30'),
(54, 46, NULL, 27, 5, NULL, '2025-10-28 12:57:35'),
(55, 47, NULL, 27, 5, NULL, '2025-10-28 15:27:10');

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_verifications`
--

INSERT INTO `otp_verifications` (`id`, `user_id`, `email`, `otp_code`, `expires_at`, `is_used`, `created_at`) VALUES
(1, 1, 'test@example.com', '321580', '2025-10-17 23:54:56', 0, '2025-10-17 23:44:56'),
(2, 9, 'debug@example.com', '775667', '2025-10-18 00:04:52', 0, '2025-10-17 23:54:52'),
(3, 10, 'customer@example.com', '640198', '2025-10-18 00:15:33', 0, '2025-10-18 00:05:33'),
(4, 11, 'customer2@example.com', '191392', '2025-10-18 00:17:14', 0, '2025-10-18 00:07:14'),
(5, 12, 'testotp@example.com', '968696', '2025-10-18 00:32:01', 0, '2025-10-18 00:22:01'),
(6, 12, 'testotp@example.com', '773224', '2025-10-18 00:37:01', 0, '2025-10-18 00:27:01'),
(7, 7, 'mianmuhammadramzan99@gmail.com', '347309', '2025-10-18 00:37:32', 0, '2025-10-18 00:27:32'),
(8, 8, 'ramzan8664@gmail.com', '623719', '2025-10-18 00:41:59', 1, '2025-10-18 00:31:59'),
(9, 5, 'jani@gmail.com', '128147', '2025-10-19 02:06:36', 0, '2025-10-19 01:56:36'),
(10, 5, 'mianmuhammadramzan99@gmail.com', '815347', '2025-10-19 02:09:55', 1, '2025-10-19 01:59:55'),
(11, 3, 'ramzan@gmail.com', '367091', '2025-10-19 22:19:56', 0, '2025-10-19 22:09:56'),
(12, 1, 'mianmuhammadramzan99@gmail.com', '312505', '2025-10-19 22:23:32', 0, '2025-10-19 22:13:32'),
(13, 1, 'mianmuhammadramzan99@gmail.com', '948706', '2025-10-19 22:26:35', 1, '2025-10-19 22:16:35'),
(14, 1, 'mianmuhammadramzan99@gmail.com', '570724', '2025-10-19 22:26:41', 0, '2025-10-19 22:16:41'),
(15, 1, 'mianmuhammadramzan99@gmail.com', '155719', '2025-10-19 22:26:45', 0, '2025-10-19 22:16:45'),
(16, 1, 'mianmuhammadramzan99@gmail.com', '846397', '2025-10-19 22:26:46', 0, '2025-10-19 22:16:46'),
(17, 1, 'mianmuhammadramzan99@gmail.com', '140371', '2025-10-19 22:44:32', 1, '2025-10-19 22:34:32'),
(18, 1, 'mianmuhammadramzan99@gmail.com', '829868', '2025-10-19 22:46:28', 1, '2025-10-19 22:36:28'),
(19, 1, 'mianmuhammadramzan99@gmail.com', '359895', '2025-10-19 22:47:41', 1, '2025-10-19 22:37:41'),
(20, 1, 'mianmuhammadramzan99@gmail.com', '183370', '2025-10-19 22:52:46', 0, '2025-10-19 22:42:46'),
(21, 5, 'mianmuhammadramzan99@gmail.com', '674127', '2025-10-19 23:00:02', 1, '2025-10-19 22:50:02'),
(22, 5, 'mianmuhammadramzan99@gmail.com', '894055', '2025-10-19 23:01:24', 0, '2025-10-19 22:51:24'),
(23, 5, 'mianmuhammadramzan99@gmail.com', '331286', '2025-10-19 23:04:00', 0, '2025-10-19 22:54:00'),
(24, 1, 'mianmuhammadramzan99@gmail.com', '807386', '2025-10-19 23:04:47', 0, '2025-10-19 22:54:47'),
(25, 1, 'mianmuhammadramzan99@gmail.com', '186293', '2025-10-19 23:05:27', 0, '2025-10-19 22:55:27'),
(26, 1, 'mianmuhammadramzan99@gmail.com', '349931', '2025-10-19 23:06:28', 0, '2025-10-19 22:56:28'),
(27, 1, 'mianmuhammadramzan99@gmail.com', '496212', '2025-10-19 23:07:07', 0, '2025-10-19 22:57:07'),
(28, 1, 'mianmuhammadramzan99@gmail.com', '227782', '2025-10-19 23:07:45', 0, '2025-10-19 22:57:45'),
(29, 1, 'mianmuhammadramzan99@gmail.com', '432347', '2025-10-19 23:09:43', 0, '2025-10-19 22:59:43'),
(30, 1, 'mianmuhammadramzan99@gmail.com', '961358', '2025-10-19 23:10:11', 0, '2025-10-19 23:00:11'),
(31, 1, 'mianmuhammadramzan99@gmail.com', '811103', '2025-10-19 23:12:27', 1, '2025-10-19 23:02:27'),
(32, 1, 'mianmuhammadramzan99@gmail.com', '635243', '2025-10-19 23:15:20', 1, '2025-10-19 23:05:20'),
(33, 1, 'mianmuhammadramzan99@gmail.com', '227013', '2025-10-19 23:16:52', 1, '2025-10-19 23:06:52'),
(34, 1, 'mianmuhammadramzan99@gmail.com', '902024', '2025-10-19 23:19:02', 1, '2025-10-19 23:09:02'),
(35, 5, 'mianmuhammadramzan99@gmail.com', '307866', '2025-10-19 23:20:38', 1, '2025-10-19 23:10:38'),
(36, 14, 'enablecoding@gmail.com', '168197', '2025-10-22 21:46:27', 1, '2025-10-22 21:36:27'),
(37, 15, 'enablecoding@gmail.com', '178951', '2025-10-22 21:57:34', 1, '2025-10-22 21:47:34'),
(38, 15, 'enablecoding@gmail.com', '876665', '2025-10-22 21:59:15', 1, '2025-10-22 21:49:15'),
(39, 15, 'enablecoding@gmail.com', '350165', '2025-10-22 22:01:43', 0, '2025-10-22 21:51:43'),
(40, 5, 'mianmuhammadramzan99@gmail.com', '246472', '2025-10-22 22:51:52', 0, '2025-10-22 22:41:52'),
(41, 5, 'mianmuhammadramzan99@gmail.com', '373312', '2025-10-22 23:03:21', 0, '2025-10-22 22:53:21'),
(42, 5, 'mianmuhammadramzan99@gmail.com', '417686', '2025-10-22 23:08:40', 0, '2025-10-22 22:58:40'),
(43, 5, 'mianmuhammadramzan99@gmail.com', '428104', '2025-10-22 23:10:12', 0, '2025-10-22 23:00:12'),
(44, 5, 'mianmuhammadramzan99@gmail.com', '673429', '2025-10-22 23:10:27', 1, '2025-10-22 23:00:27'),
(45, 15, 'enablecoding@gmail.com', '902851', '2025-10-22 23:11:51', 0, '2025-10-22 23:01:51'),
(46, 15, 'enablecoding@gmail.com', '930802', '2025-10-22 23:15:52', 1, '2025-10-22 23:05:52'),
(47, 15, 'enablecoding@gmail.com', '452197', '2025-10-22 23:16:17', 0, '2025-10-22 23:06:17'),
(48, 1, 'mianmuhammadramzan99@gmail.com', '829073', '2025-10-23 00:06:01', 1, '2025-10-22 23:56:01'),
(49, 1, 'mianmuhammadramzan99@gmail.com', '391953', '2025-10-23 16:02:41', 0, '2025-10-23 15:52:41'),
(50, 1, 'mianmuhammadramzan99@gmail.com', '801510', '2025-10-23 16:14:45', 1, '2025-10-23 16:04:45'),
(51, 5, 'mianmuhammadramzan99@gmail.com', '980446', '2025-10-25 15:13:05', 0, '2025-10-25 15:03:05'),
(52, 5, 'mianmuhammadramzan99@gmail.com', '659106', '2025-10-25 15:21:16', 0, '2025-10-25 15:11:16'),
(53, 5, 'mianmuhammadramzan99@gmail.com', '944076', '2025-10-25 15:23:06', 0, '2025-10-25 15:13:06');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) NOT NULL,
  `stripe_charge_id` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'gbp',
  `status` enum('pending','succeeded','failed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_method_details` text DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `stripe_payment_intent_id`, `stripe_charge_id`, `amount`, `currency`, `status`, `payment_method`, `payment_method_details`, `metadata`, `created_at`, `updated_at`) VALUES
(1, NULL, 'pi_3SHCDGD3H6qI9jyC1O6ryNr0', NULL, 57.80, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":48,\"tax\":4.800000000000001,\"shipping\":5}', '2025-10-12 04:28:35', '2025-10-28 12:48:02'),
(2, NULL, 'pi_3SHCZ5D3H6qI9jyC2eEKBGcq', NULL, 57.80, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":48,\"tax\":4.800000000000001,\"shipping\":5}', '2025-10-12 04:51:08', '2025-10-28 12:48:02'),
(3, NULL, 'pi_3SHClkD3H6qI9jyC2g9yneZg', NULL, 57.80, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":48,\"tax\":4.800000000000001,\"shipping\":5}', '2025-10-12 05:04:14', '2025-10-28 12:48:02'),
(4, NULL, 'pi_3SHjuTD3H6qI9jyC03L7kmBX', NULL, 57.80, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":48,\"tax\":4.800000000000001,\"shipping\":5}', '2025-10-13 16:27:25', '2025-10-28 12:48:02'),
(5, NULL, 'pi_3SHkobD3H6qI9jyC0vYLrGfD', NULL, 57.80, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":48,\"tax\":4.800000000000001,\"shipping\":5}', '2025-10-13 17:25:25', '2025-10-28 12:48:02'),
(6, NULL, 'pi_3SHlR4D3H6qI9jyC1NRiuEfi', NULL, 57.80, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":48,\"tax\":4.800000000000001,\"shipping\":5}', '2025-10-13 18:05:10', '2025-10-28 12:48:02'),
(7, NULL, 'pi_3SHpxsD3H6qI9jyC2LNCM0Bn', NULL, 18.20, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":1.2000000000000002,\"shipping\":5}', '2025-10-13 22:55:21', '2025-10-28 12:48:02'),
(8, NULL, 'pi_3SHpyqD3H6qI9jyC1wxXdA90', NULL, 18.20, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":1.2000000000000002,\"shipping\":5}', '2025-10-13 22:56:21', '2025-10-28 12:48:02'),
(9, NULL, 'pi_3SHqs2D3H6qI9jyC2wDdwDMv', NULL, 30.30, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/34\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":23,\"tax\":2.3000000000000003,\"shipping\":5}', '2025-10-13 23:53:23', '2025-10-28 12:48:02'),
(10, NULL, 'pi_3SHqsqD3H6qI9jyC0Rgzn8qo', NULL, 30.30, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/34\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":23,\"tax\":2.3000000000000003,\"shipping\":5}', '2025-10-13 23:54:13', '2025-10-28 12:48:02'),
(11, NULL, 'pi_3SHqvRD3H6qI9jyC2g3qRJUd', NULL, 30.30, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/34\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":23,\"tax\":2.3000000000000003,\"shipping\":5}', '2025-10-13 23:56:54', '2025-10-28 12:48:02'),
(12, NULL, 'pi_3SHqxGD3H6qI9jyC19oyBJyj', NULL, 30.30, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/34\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":23,\"tax\":2.3000000000000003,\"shipping\":5}', '2025-10-13 23:58:47', '2025-10-28 12:48:02'),
(13, NULL, 'pi_3SJHc9D3H6qI9jyC2BiCoc3s', NULL, 18.20, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":1.2000000000000002,\"shipping\":5}', '2025-10-17 22:38:54', '2025-10-28 12:48:02'),
(14, NULL, 'pi_3SJh9ED3H6qI9jyC0Mt8teNz', NULL, 56.70, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":2,\"subtotal\":47,\"tax\":4.7,\"shipping\":5}', '2025-10-19 01:54:44', '2025-10-28 12:48:02'),
(15, NULL, 'pi_3SJhGPD3H6qI9jyC23N2Drnu', NULL, 18.20, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfasdfa\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":1.2000000000000002,\"shipping\":5}', '2025-10-19 02:02:09', '2025-10-28 12:48:02'),
(16, NULL, 'pi_3SJhHsD3H6qI9jyC2Zc0MExm', NULL, 18.20, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfasdf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":1.2000000000000002,\"shipping\":5}', '2025-10-19 02:03:41', '2025-10-28 12:48:02'),
(17, NULL, 'pi_3SJwzYD3H6qI9jyC1DBbxoVK', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-19 18:49:48', '2025-10-28 12:48:02'),
(18, NULL, 'pi_3SJwzcD3H6qI9jyC28JprF9u', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-19 18:49:52', '2025-10-28 12:48:02'),
(19, NULL, 'pi_3SJxSnD3H6qI9jyC2540NX8g', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfsd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"124\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-19 19:20:01', '2025-10-28 12:48:02'),
(20, NULL, 'pi_3SJygaD3H6qI9jyC00k6Zcf0', NULL, 548.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfasdf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"1234\"}', '{\"user_id\":5,\"order_items\":2,\"subtotal\":548,\"tax\":0,\"shipping\":0}', '2025-10-19 20:38:20', '2025-10-28 12:48:02'),
(21, NULL, 'pi_3SLJkiD3H6qI9jyC19KbJ9Es', NULL, 268.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0}', '2025-10-23 13:20:08', '2025-10-28 12:48:02'),
(22, NULL, 'pi_3SLTnfD3H6qI9jyC0ZXEkvky', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"sdasdfsd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-24 00:03:52', '2025-10-28 12:48:02'),
(23, NULL, 'pi_3SLUvlD3H6qI9jyC1xk0MfWQ', NULL, 268.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asda\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0}', '2025-10-24 01:16:18', '2025-10-28 12:48:02'),
(24, NULL, 'pi_3SLr71D3H6qI9jyC0S3svUOf', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"rasdas\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 00:57:23', '2025-10-28 12:48:02'),
(25, NULL, 'pi_3SLsmSD3H6qI9jyC1iAPyUHp', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"mainasdfas\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 02:44:15', '2025-10-28 12:48:02'),
(26, NULL, 'pi_3SLsoKD3H6qI9jyC0llWX2wt', NULL, 29.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"ramznasa\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":24,\"tax\":0,\"shipping\":5}', '2025-10-25 02:46:11', '2025-10-28 12:48:02'),
(27, NULL, 'pi_3SLsvgD3H6qI9jyC2mIjU2Eh', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfasd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 02:53:47', '2025-10-28 12:48:02'),
(28, NULL, 'pi_3SLt5pD3H6qI9jyC0MEIhDFz', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfasd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 03:04:16', '2025-10-28 12:48:02'),
(29, NULL, 'pi_3SLtFfD3H6qI9jyC1nW7NdDs', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 03:14:26', '2025-10-28 12:48:02'),
(30, NULL, 'pi_3SLtJxD3H6qI9jyC01CPlcpp', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"sdfgsdf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 03:18:52', '2025-10-28 12:48:02'),
(31, NULL, 'pi_3SLtPsD3H6qI9jyC2oDSwteV', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"234\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 03:24:59', '2025-10-28 12:48:02'),
(32, NULL, 'pi_3SLtUQD3H6qI9jyC1lfqoACT', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfad\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"124\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 03:29:41', '2025-10-28 12:48:02'),
(33, NULL, 'pi_3SM4r4D3H6qI9jyC2odHMqcU', NULL, 65.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"sdaasd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"232\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":60,\"tax\":0,\"shipping\":5}', '2025-10-25 15:37:50', '2025-10-28 12:48:02'),
(34, NULL, 'pi_3SM4xGD3H6qI9jyC2xLNRS0O', NULL, 65.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"sdaasd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"232\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":60,\"tax\":0,\"shipping\":5}', '2025-10-25 15:44:13', '2025-10-28 12:48:02'),
(35, NULL, 'pi_3SM4zzD3H6qI9jyC1KpzZ0T5', NULL, 268.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfasd\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"1234\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0}', '2025-10-25 15:47:03', '2025-10-28 12:48:02'),
(36, NULL, 'pi_3SM54mD3H6qI9jyC2p7tR0Z8', NULL, 41.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"sfadf\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":36,\"tax\":0,\"shipping\":5}', '2025-10-25 15:52:00', '2025-10-28 12:48:02'),
(37, NULL, 'pi_3SM59TD3H6qI9jyC2sdjqXhw', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"safdasdfa\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"124\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 15:56:50', '2025-10-28 12:48:02'),
(38, NULL, 'pi_3SM5EzD3H6qI9jyC1oBPEQFF', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"asdfa\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 16:02:32', '2025-10-28 12:48:02'),
(39, NULL, 'pi_3SM5IdD3H6qI9jyC2LzNeZVD', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Test User\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 16:06:19', '2025-10-28 12:48:02'),
(40, NULL, 'pi_3SM5JmD3H6qI9jyC2XTJDRWP', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Test User\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 16:07:30', '2025-10-28 12:48:02'),
(41, NULL, 'pi_3SM5KnD3H6qI9jyC2D46YBiF', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Test User\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 16:08:32', '2025-10-28 12:48:02'),
(42, NULL, 'pi_3SM5LoD3H6qI9jyC1gpJqRpM', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Test User\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 16:09:36', '2025-10-28 12:48:02'),
(43, NULL, 'pi_3SM5MMD3H6qI9jyC2xEq7LjK', NULL, 17.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Test User\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":12,\"tax\":0,\"shipping\":5}', '2025-10-25 16:10:09', '2025-10-28 12:48:02'),
(44, NULL, 'pi_3SMojbD3H6qI9jyC1tiZ1NJc', NULL, 268.00, 'gbp', 'succeeded', 'paypal', '{\"method\":\"paypal\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0,\"payment_method\":\"paypal\"}', '2025-10-27 16:37:11', '2025-10-28 12:48:02'),
(45, NULL, 'pi_3SN7OLD3H6qI9jyC2mLyEPoN', NULL, 151.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0,\"payment_method\":\"creditCard\"}', '2025-10-28 12:32:29', '2025-10-28 12:48:02'),
(46, NULL, 'pi_3SN7hXD3H6qI9jyC1BXRL3Vk', NULL, 151.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0,\"payment_method\":\"creditCard\"}', '2025-10-28 12:52:19', '2025-10-28 12:52:19'),
(47, NULL, 'pi_3SN7kcD3H6qI9jyC133QpcpR', NULL, 151.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzan\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0,\"payment_method\":\"creditCard\"}', '2025-10-28 12:55:30', '2025-10-28 12:55:30'),
(48, NULL, 'pi_3SN7mdD3H6qI9jyC2g0dBZiK', NULL, 268.00, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"dsafds\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/26\",\"cvv\":\"123\"}', '{\"user_id\":5,\"order_items\":1,\"subtotal\":268,\"tax\":0,\"shipping\":0,\"payment_method\":\"creditCard\"}', '2025-10-28 12:57:35', '2025-10-28 12:57:35'),
(49, NULL, 'pi_3SNA7OD3H6qI9jyC2Dx7OMS4', NULL, 182.50, 'gbp', 'succeeded', 'creditCard', '{\"cardholderName\":\"Mian Muhammad Ramzna\",\"cardNumber\":\"4242 4242 4242 4242\",\"expDate\":\"12/23\",\"cvv\":\"124\"}', '{\"user_id\":5,\"order_items\":2,\"subtotal\":311,\"tax\":0,\"shipping\":0,\"payment_method\":\"creditCard\"}', '2025-10-28 15:27:10', '2025-10-28 15:27:10');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `sku` varchar(50) NOT NULL,
  `name` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `category_value_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `stock_status` enum('Active','Low Stock','Out of Stock') DEFAULT 'Active',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `date_added` date DEFAULT curdate(),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `original_price` decimal(10,2) DEFAULT NULL COMMENT 'Original price before discount',
  `current_price` decimal(10,2) DEFAULT NULL COMMENT 'Current selling price',
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage calculated automatically',
  `materials_care` text DEFAULT NULL COMMENT 'Materials and care instructions for the product',
  `delivery_returns` text DEFAULT NULL COMMENT 'Delivery and returns information',
  `return_exchanges` text DEFAULT NULL COMMENT 'Return and exchange policy information',
  `contact_info` text DEFAULT NULL COMMENT 'Contact information for product support',
  `fit_options` text DEFAULT NULL COMMENT 'Available fit options for the product (JSON string)',
  `default_fit` varchar(50) DEFAULT NULL COMMENT 'Default fit option',
  `fit_required` tinyint(1) DEFAULT 0 COMMENT 'Whether fit selection is required for this product'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `code`, `sku`, `name`, `description`, `category_value_id`, `price`, `stock`, `stock_status`, `status`, `date_added`, `created_at`, `updated_at`, `original_price`, `current_price`, `discount_percentage`, `materials_care`, `delivery_returns`, `return_exchanges`, `contact_info`, `fit_options`, `default_fit`, `fit_required`) VALUES
(2, 'PRD-00002', 'SKU-MG7U0TUT-QYB84', 'Testing product', 'fldsjafldsa fldsa dsadsa', 6, 300.00, 0, 'Out of Stock', 'Active', '2025-10-01', '2025-10-01 15:16:57', '2025-10-27 14:58:03', 400.00, 300.00, 25.00, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(3, 'PRD-00003', 'SKU-MG7U19CV-J6KV2', 'Testing product', 'fldsjafldsa fldsa dsadsa', 8, 300.00, 30, 'Active', 'Active', '2025-10-01', '2025-10-01 15:17:17', '2025-10-27 14:58:03', 400.00, 300.00, 25.00, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(4, 'PRD-00004', 'TESTING-6AFC6CA2', 'Testing', 'afdsasihT', 8, 300.00, 30, 'Active', 'Active', '2025-10-01', '2025-10-01 15:28:31', '2025-10-27 14:58:03', 400.00, 300.00, 25.00, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(5, 'PRD-00005', 'THIS-TESTING-9953ACED', 'Updated Product', 'Updated description', 6, 23.00, 0, 'Out of Stock', 'Active', '2025-10-01', '2025-10-01 15:30:13', '2025-10-27 14:58:03', 33.00, 23.00, 30.30, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(7, 'PRD-00007', 'BSA-UK1EOAFS', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 50, 'Active', 'Active', '2025-10-01', '2025-10-01 15:36:24', '2026-02-20 21:00:48', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, '', 0),
(8, 'PRD-00008', 'BSA-GWNWXIXD', 'Black SIlk Abaya', 'fdslafkdsa', 7, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:36:51', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(9, 'PRD-00009', 'BSA-H1IWRY2D', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:37:32', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(10, 'PRD-00010', 'BSA-D305YAO0', 'Black SIlk Abaya', 'fdslafkdsa', 8, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:00', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(11, 'PRD-00011', 'BSA-FT1GNCS4', 'Black SIlk Abaya', 'fdslafkdsa', 9, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:04', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(12, 'PRD-00012', 'BSA-8TT2D302', 'Black SIlk Abaya', 'fdslafkdsa', 9, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:04', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(13, 'PRD-00013', 'BSA-J6CFUPPP', 'Black SIlk Abaya', 'fdslafkdsa', 10, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:05', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(14, 'PRD-00014', 'BSA-5GT87547', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:07', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(15, 'PRD-00015', 'BSA-4AVCILJU', 'Black SIlk Abaya ......', 'fdslafkdsa', 7, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:07', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(16, 'PRD-00016', 'BSA-ZK6EFBXR', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:07', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(17, 'PRD-00017', 'BSA-M1L63XBK', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:11', '2025-10-27 14:58:03', 60.00, 50.00, 16.67, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(19, 'PRD-00019', 'A-2WIMT3N0', 'Updated Test Product', 'Product name: Aurora X200 Wireless Noise-Cancelling Headphones<div>SKU: AUR-X200-BLK</div><div><ul><li>Short description: Premium over-ear Bluetooth headphones with active noise cancellation, 40-hour battery, and studio-grade sound.</li></ul></div><div>Price: $129.99 (USD) — Sale: $99.99 (limited time)</div><div><ul><li>Currency: USD</li></ul></div><div>Stock: 1,250 units</div><div>Category: Electronics / Audio</div><div>Tags: wireless, ANC, bluetooth, over-ear, long-battery</div><div>Key features:</div><div><ol><li><b><br></b></li><li><b>1: Active Noise Cancellation (ANC) with ambient mode</b></li><li><b>Bluetooth 5.3, aptX HD support</b></li><li><b>40 hours playback (standard mode), 20 min quick charge → 6 hours</b></li><li><b>Built-in microphone with ENC for clear calls</b></li><li><b>Foldable, lightweight aluminum frame with memory-foam earcups</b></li><li><b>On-device touch controls + voice assistant support</b></li><li><b>Technical specifications:</b></li><li><b>Drivers: 40 mm dynamic</b></li><li><b>Frequency response: 20 Hz – 20 kH</b></li></ol></div>', 7, 23.00, 1000, 'Active', 'Active', '2025-10-02', '2025-10-02 01:30:18', '2025-10-28 13:18:47', 10.00, 23.00, NULL, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.\n\nany extra information that you want to add  >>>>>>>>>>>>', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', '[\"Fitted\",\"Loose Fit\",\"Oversized\",\"Relaxed Fit\",\"Slim Fit\",\"Standard Fit\"]', 'Oversized', 1),
(20, 'PRD-00020', 'A-61FVUKBD', 'asdfasd', 'a', 6, 234.00, 90, 'Active', 'Active', '2025-10-08', '2025-10-08 23:12:27', '2025-10-27 14:58:03', 2344.00, 234.00, 90.02, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(21, 'PRD-00021', 'TP-NHUQ4CUZ', 'Testing product', 'dts', 6, 12.00, 100, 'Active', 'Active', '2025-10-11', '2025-10-11 18:52:25', '2025-10-27 14:58:03', 123.00, 12.00, 90.24, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', NULL, NULL, 0),
(22, 'PRD-00022', 'AT-C75UTQCJ', 'Again tesgin', 'testing ........', 6, 200.00, 200, 'Active', 'Inactive', '2025-10-27', '2025-10-27 15:10:10', '2026-02-20 21:00:04', 200.00, 200.00, NULL, 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.', 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.', 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.', 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.', '[\"Fitted\",\"Loose Fit\",\"Oversized\",\"Relaxed Fit\",\"Slim Fit\",\"Standard Fit\"]', 'Relaxed Fit', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `order` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `order`) VALUES
(116, 8, 'http://localhost:3000/uploads/products/8/mg7uqf5u-b33e0353446bea82.jpg', 1),
(117, 8, 'http://localhost:3000/uploads/products/8/mg7uqf5v-ca6da264f6d81209.jpg', 2),
(118, 8, 'http://localhost:3000/uploads/products/8/mg7uqf5w-39c09d54ceb311b1.jpg', 3),
(119, 8, 'http://localhost:3000/uploads/products/8/mg7uqf5x-e350d64407250e9c.jpg', 4),
(120, 8, 'http://localhost:3000/uploads/products/8/mg7uqf5x-32d9107aea4a504f.jpg', 5),
(151, 9, 'http://localhost:3000/uploads/products/9/mg7uramf-de10389db058ab0e.jpg', 1),
(152, 9, 'http://localhost:3000/uploads/products/9/mg7uramh-b05819c9c3240b8b.jpg', 2),
(153, 9, 'http://localhost:3000/uploads/products/9/mg7urami-b424b2477e81eeaf.jpg', 3),
(154, 9, 'http://localhost:3000/uploads/products/9/mg7uramj-7b40c0bdd9ef47c7.jpg', 4),
(155, 9, 'http://localhost:3000/uploads/products/9/mg7uramj-01c214e1703914d1.jpg', 5),
(156, 10, 'http://localhost:3000/uploads/products/10/mg7urw3b-e4bf2d9f7db89e91.jpg', 1),
(157, 10, 'http://localhost:3000/uploads/products/10/mg7urw3c-e8a0756796b84014.jpg', 2),
(158, 10, 'http://localhost:3000/uploads/products/10/mg7urw3c-45ecdf4ef3056418.jpg', 3),
(159, 10, 'http://localhost:3000/uploads/products/10/mg7urw3d-8ae522eba427cc26.jpg', 4),
(160, 10, 'http://localhost:3000/uploads/products/10/mg7urw3e-5caf091afc9e278d.jpg', 5),
(161, 11, 'http://localhost:3000/uploads/products/11/mg7urz0k-a63ee1ee7bb67b23.jpg', 1),
(162, 11, 'http://localhost:3000/uploads/products/11/mg7urz0k-80d5df0aa7cc3e94.jpg', 2),
(163, 11, 'http://localhost:3000/uploads/products/11/mg7urz0l-ed60b80fc2490675.jpg', 3),
(164, 11, 'http://localhost:3000/uploads/products/11/mg7urz0m-47ab2c449ece426a.jpg', 4),
(165, 11, 'http://localhost:3000/uploads/products/11/mg7urz0m-4bfc9a850db88b8f.jpg', 5),
(166, 12, 'http://localhost:3000/uploads/products/12/mg7urzi9-2d35a8bb74f74c37.jpg', 1),
(167, 12, 'http://localhost:3000/uploads/products/12/mg7urzi9-f37b3c7b1d5372f8.jpg', 2),
(168, 12, 'http://localhost:3000/uploads/products/12/mg7urzia-53ae6259dae52d77.jpg', 3),
(169, 12, 'http://localhost:3000/uploads/products/12/mg7urzib-ccc54230706cb657.jpg', 4),
(170, 12, 'http://localhost:3000/uploads/products/12/mg8mu4f6-683ea3f0965b0edd.jpg', 5),
(171, 13, 'http://localhost:3000/uploads/products/13/mgiayk8w-21fda6a369e12ca5.jpg', 1),
(172, 13, 'http://localhost:3000/uploads/products/13/mgiayk91-c0abe049d39ee757.jpg', 2),
(173, 13, 'http://localhost:3000/uploads/products/13/mgiayk93-20600b79ab055c61.jpg', 3),
(174, 13, 'http://localhost:3000/uploads/products/13/mgiayk94-9b87bdfec74b2223.jpg', 4),
(175, 14, 'http://localhost:3000/uploads/products/14/mg7us1ia-f0141c42acb957c5.jpg', 1),
(176, 14, 'http://localhost:3000/uploads/products/14/mg7us1ib-5f153b76b4a6b404.jpg', 2),
(177, 14, 'http://localhost:3000/uploads/products/14/mg7us1ib-54ddaa52cef7c09e.jpg', 3),
(178, 14, 'http://localhost:3000/uploads/products/14/mg7us1ic-c0d3d430b8917881.jpg', 4),
(179, 14, 'http://localhost:3000/uploads/products/14/mg7us1ic-904148aaa4763b77.jpg', 5),
(180, 16, 'http://localhost:3000/uploads/products/16/mg7us1ss-99163e3c5b2c9cbb.jpg', 1),
(181, 16, 'http://localhost:3000/uploads/products/16/mg7us1ss-da3e9a910ad9c1f7.jpg', 2),
(182, 16, 'http://localhost:3000/uploads/products/16/mg7us1st-7d1ec4941ac31e90.jpg', 3),
(183, 16, 'http://localhost:3000/uploads/products/16/mg7us1st-57ee332bab6cbf50.jpg', 4),
(184, 16, 'http://localhost:3000/uploads/products/16/mg7us1st-d172a256c658e199.jpg', 5),
(185, 17, 'http://localhost:3000/uploads/products/17/mg7us4px-6dafa35bea3f844c.jpg', 1),
(186, 17, 'http://localhost:3000/uploads/products/17/mg7us4py-0edd3c21e453adbb.jpg', 2),
(187, 17, 'http://localhost:3000/uploads/products/17/mg7us4py-a0f211578dabf0e5.jpg', 3),
(188, 17, 'http://localhost:3000/uploads/products/17/mg7us4pz-9ea6e00a9aa087be.jpg', 4),
(189, 17, 'http://localhost:3000/uploads/products/17/mg7us4pz-7085c0fe10d0345e.jpg', 5),
(190, 15, 'http://localhost:3000/uploads/products/15/mgiazx1g-a990e050e3e4de6c.jpg', 1),
(191, 15, 'http://localhost:3000/uploads/products/15/mgiazx1i-0cc6d0c16187efe0.jpg', 2),
(192, 15, 'http://localhost:3000/uploads/products/15/mgiazx1k-c0253b2155492037.jpg', 3),
(193, 15, 'http://localhost:3000/uploads/products/15/mgiazx1m-89a181c63aeedd35.jpg', 4),
(194, 4, 'http://localhost:3000/uploads/products/4/mg7ufpf9-5641879e875cbec7.jpg', 1),
(195, 4, 'http://localhost:3000/uploads/products/4/mg7ufpfi-1f76102507034f7b.jpg', 2),
(196, 4, 'http://localhost:3000/uploads/products/4/mg7ufpfj-6d08257c240af98d.jpg', 3),
(197, 4, 'http://localhost:3000/uploads/products/4/mg7ufpfj-c9862f71eef737b5.jpg', 4),
(198, 4, 'http://localhost:3000/uploads/products/4/mg7ufpfj-fde62aa054b02629.jpg', 5),
(199, 2, 'http://localhost:3000/uploads/products/2/mg7u0tvf-e431ee6b14c870ab.jpg', 1),
(200, 2, 'http://localhost:3000/uploads/products/2/mg7u0tvr-3e695b2b55219a5d.jpg', 2),
(201, 2, 'http://localhost:3000/uploads/products/2/mg7u0tvr-7355a3034e902a67.jpg', 3),
(202, 2, 'http://localhost:3000/uploads/products/2/mg7u0tvs-7c01f50e08ea51e2.jpg', 4),
(203, 2, 'http://localhost:3000/uploads/products/2/mg7u0tvs-583742b239aedac7.jpg', 5),
(209, 5, 'http://localhost:3000/uploads/products/5/mgib181o-de266ec74ea63cfb.jpg', 1),
(210, 5, 'http://localhost:3000/uploads/products/5/mgib181r-7329ba6d6ec78d8b.jpg', 2),
(211, 5, 'http://localhost:3000/uploads/products/5/mgib181t-831b0018a82397e7.jpg', 3),
(212, 5, 'http://localhost:3000/uploads/products/5/mgib181v-8405810053d8fa64.jpg', 4),
(225, 21, 'http://localhost:3000/uploads/products/21/mgmc4fwf-97d0782a0dd9027c.jpg', 1),
(226, 21, 'http://localhost:3000/uploads/products/21/mgmc4fwl-3b9c32b3e573b29b.jpg', 2),
(227, 21, 'http://localhost:3000/uploads/products/21/mgmc4fwn-8c4f6835250810af.jpg', 3),
(228, 21, 'http://localhost:3000/uploads/products/21/mgmc4fwp-7c1b764a4d95f9f0.jpg', 4),
(229, 3, 'http://localhost:3000/uploads/products/3/mg7u19d1-838a7aebfa921fae.jpg', 1),
(230, 3, 'http://localhost:3000/uploads/products/3/mg7u19d2-ee1882a2d373325e.jpg', 2),
(231, 3, 'http://localhost:3000/uploads/products/3/mg7u19d3-f9f6f5d7d425ebdb.jpg', 3),
(232, 3, 'http://localhost:3000/uploads/products/3/mg7u19d4-f6f39610a330f938.jpg', 4),
(233, 3, 'http://localhost:3000/uploads/products/3/mg7u19d4-8e4276062dd3d3d0.jpg', 5),
(234, 20, 'http://localhost:3000/uploads/products/20/mgib3aan-ccd5bea86a39c0f5.jpg', 1),
(235, 20, 'http://localhost:3000/uploads/products/20/mgib3aar-d5bf4a50b8eb7a4f.jpg', 2),
(236, 20, 'http://localhost:3000/uploads/products/20/mgib3aat-9ea9b38a2fa45630.jpg', 3),
(237, 20, 'http://localhost:3000/uploads/products/20/mgib3aav-f13369f26cdc27c6.jpg', 4),
(262, 19, 'http://localhost:3000/uploads/products/19/mg8hhnm1-dc8a0bb52264efef.jpg', 1),
(263, 19, 'http://localhost:3000/uploads/products/19/mg8hhnm6-16fc4f0336c195c4.jpg', 2),
(264, 19, 'http://localhost:3000/uploads/products/19/mg8hhnm7-ce8b3be468dd3cab.jpg', 3),
(265, 19, 'http://localhost:3000/uploads/products/19/mg8mv81g-98115437a5d0b59b.jpg', 4),
(266, 22, 'http://localhost:3000/uploads/products/22/mlv2lwlz-78c5f482aca9323b.jpg', 1),
(267, 22, 'http://localhost:3000/uploads/products/22/mlv2lwm1-072e097cb508828e.jpg', 2),
(268, 22, 'http://localhost:3000/uploads/products/22/mlv2lwm2-f715b42e359f9df0.jpg', 3),
(269, 7, 'http://localhost:3000/uploads/products/7/mlv2tzik-ab07f1edf05a351e.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `extra_price` decimal(10,2) DEFAULT 0.00,
  `stock` int(11) DEFAULT 0,
  `size` enum('XS','S','M','L','XL','XXL','XXXL') DEFAULT NULL,
  `color_name` varchar(100) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL COMMENT 'Hex color code like #FF5733',
  `color_image` varchar(500) DEFAULT NULL COMMENT 'Optional color swatch image URL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `extra_price`, `stock`, `size`, `color_name`, `color_code`, `color_image`) VALUES
(45, 13, 'BLACK-SILK-ABAYA-S-Black', 0.00, 234, 'S', 'Black', '#000000', ''),
(49, 15, 'BLACK-SILK-ABAYA-......-S-Black', 0.00, 234, 'S', 'Black', '#000000', ''),
(50, 4, 'TESTING-S-Black', 0.00, 10, 'S', 'Black', '#000000', ''),
(51, 2, 'TESTING-PRODUCT-S-Black', 0.00, 23, 'S', 'Black', '#000000', ''),
(55, 21, 'TESTING-PRODUCT-S-Red', 0.00, 60, 'S', 'Red', '#f50f0f', ''),
(56, 20, 'ASDFASD-M-sdfgs', 34.00, 19, 'M', 'sdfgs', '#000000', ''),
(57, 20, 'ASDFASD-S-asdfasd', 0.00, 29, 'S', 'asdfasd', '#683c3c', ''),
(58, 20, 'ASDFASD-L-asdfads', 0.00, 30, 'L', 'asdfads', '#0d8bc9', ''),
(69, 19, 'UPDATED-TEST-PRODUCT-S-asdfasd', 20.00, 771, 'S', 'asdfasd', '#000000', ''),
(70, 19, 'UPDATED-TEST-PRODUCT-M-Blue', 8.00, 23, 'M', 'Blue', '#087fba', ''),
(71, 19, 'UPDATED-TEST-PRODUCT-L-blue', 0.00, 104, 'L', 'blue', '#0657f9', ''),
(72, 22, 'AGAIN-TESGIN-S-Red', 0.00, 10, 'S', 'Red', '#f91515', ''),
(73, 7, 'BLACK-SILK-ABAYA-S-Red', 0.00, 50, 'S', 'Red', '#e02424', '');

-- --------------------------------------------------------

--
-- Table structure for table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `expiry_date` datetime DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promo_codes`
--

INSERT INTO `promo_codes` (`id`, `code`, `discount_type`, `discount_value`, `status`, `expiry_date`, `description`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 'active', NULL, 'Welcome discount - 10% off', '2025-10-23 19:53:26', '2025-10-23 19:53:26'),
(2, 'TEST', 'percentage', 50.00, 'active', NULL, 'Save 50% on your order', '2025-10-23 19:53:26', '2025-10-25 11:02:02'),
(3, 'FREESHIP', 'fixed', 5.00, 'active', NULL, 'Free shipping discount', '2025-10-23 19:53:26', '2025-10-24 18:31:48'),
(5, 'HOLIDAY25', 'percentage', 25.00, 'inactive', NULL, 'Holiday special - 25% off (expired)', '2025-10-23 19:53:26', '2025-10-23 19:53:26'),
(6, '23SDAF', 'percentage', 10.00, 'active', '2025-10-25 05:00:00', 'asdfasdf', '2025-10-23 19:58:38', '2025-10-23 19:58:38');

-- --------------------------------------------------------

--
-- Table structure for table `recently_viewed`
--

CREATE TABLE `recently_viewed` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `viewed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recently_viewed`
--

INSERT INTO `recently_viewed` (`id`, `user_id`, `product_id`, `viewed_at`) VALUES
(2, 5, 4, '2025-10-11 18:58:57'),
(6, 8, 19, '2025-10-19 01:45:11'),
(7, 8, 21, '2025-10-19 01:45:21'),
(16, 5, 13, '2025-10-19 19:58:31'),
(17, 5, 11, '2025-10-19 19:58:35'),
(45, 5, 14, '2025-10-24 00:03:05'),
(74, 5, 21, '2025-10-28 12:35:21'),
(89, 5, 22, '2025-10-28 15:19:00'),
(90, 5, 19, '2025-10-28 15:19:11'),
(92, 5, 20, '2025-10-28 17:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(30) NOT NULL,
  `description` text DEFAULT NULL,
  `level` tinyint(4) DEFAULT 3,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `level`, `status`, `created_at`) VALUES
(1, 'RL-001', 'Super_Admin', 'Full platform access. Can manage roles, users, lookups, catalog, orders, and settings.', 1, 'Active', '2025-09-23 23:42:11'),
(2, 'RL-002', 'Admin', 'Manage catalog, orders, customers, lookups, and users (except Super Admins).', 2, 'Active', '2025-09-23 23:42:11'),
(3, 'RL-003', 'Manager', 'Operational role. Can manage products, orders, and customers. No role/permission edits.', 3, 'Active', '2025-09-23 23:42:11'),
(4, 'RL-004', 'Customer', 'Customer role for public users', 4, 'Active', '2025-10-02 03:06:06');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `method_value_id` int(11) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipments`
--

INSERT INTO `shipments` (`id`, `order_id`, `method_value_id`, `scheduled_date`, `cost`) VALUES
(35, 35, 28, NULL, 5.00),
(36, 36, 28, NULL, 5.00),
(37, 37, 28, NULL, 5.00),
(38, 38, 28, NULL, 5.00),
(39, 39, 28, NULL, 5.00),
(40, 40, 28, NULL, 5.00),
(41, 41, 28, NULL, 5.00),
(42, 42, 28, NULL, 5.00),
(43, 43, 28, NULL, 5.00),
(44, 44, 28, NULL, 5.00),
(45, 45, 28, NULL, 5.00),
(46, 46, 28, NULL, 5.00),
(47, 47, 28, NULL, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` datetime DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `role_id` int(11) NOT NULL,
  `user_type` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `code`, `name`, `email`, `email_verified`, `email_verified_at`, `password_hash`, `phone`, `status`, `role_id`, `user_type`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'USR-001', 'Super Admin', 'mianmuhammadramzan99@gmail.com', 1, '2025-10-23 16:05:25', '$2a$12$eQzn7xNtB.cthdDxzYO6Kuesz4C8f1ADAj8SSZLG0MuR2Npr99v6K', '03048108665', 'Active', 1, 'admin', '2026-02-20 20:59:57', '2025-09-23 23:51:29', '2026-02-20 20:59:57'),
(2, 'USR-00002', 'Test User', 'test@example.com', 0, NULL, '$2a$12$/YLz8HAeJjffd88EKmfYwuaEwX.moo40zzDR5.0La2/Ds7kx/MwSy', NULL, 'Active', 4, 'customer', '2025-10-02 03:26:10', '2025-10-02 03:26:02', '2025-10-02 03:26:10'),
(3, 'USR-00003', 'Updated Ramzan', 'ramzan@gmail.com', 0, NULL, '$2a$12$MsxReESVq3d5NV5Rx7EQzOzOqD3UIp9bNs2UjPw8dyPXp9uDGcAym', '+1234567890', 'Active', 4, 'customer', '2025-10-02 04:53:17', '2025-10-02 03:26:49', '2025-10-02 04:53:17'),
(5, 'USR-00005', 'Mian Muhammad Ramzan', 'mianmuhammadramzan99@gmail.com', 1, '2025-10-22 23:00:57', '$2a$12$EiBbqczYi2OW0A8LuduAXeDff7LkbaiF6mThLG69gBhITN8GBwgNa', NULL, 'Active', 4, 'customer', '2025-10-25 15:14:16', '2025-10-03 22:51:42', '2025-10-25 15:14:16'),
(6, 'USR-00006', 'asdfasdf', 'test2@gmail.com', 0, NULL, '$2a$12$7H1mG0Rw4ZCwZDMBkUkxzOBEnNQMuu4x97ijGkvlZZ/fAAgWmhNGG', NULL, 'Active', 4, 'customer', NULL, '2025-10-07 00:06:51', '2025-10-07 00:06:51'),
(7, 'USR-00007', 'Mian Muhammad Ramzan', 'mianmuhammadramzan9232349@gmail.com', 0, NULL, '$2a$12$FtrcO9bsoQ4iISLrbp5IneeFWQIvws.F8D..rnAce9HWohwcX5fRy', NULL, 'Active', 4, 'customer', '2025-10-18 00:01:43', '2025-10-17 23:36:31', '2025-10-19 01:38:17'),
(8, 'USR-00008', 'ramzan', 'ramzan8664@gmail.com', 1, '2025-10-18 00:32:20', '$2a$12$ECrq/2BHBplxxIMvMF8lzOEhWZaQUX6UTPOlFKULGegcQQg404Jte', NULL, 'Active', 4, 'customer', '2025-10-18 00:39:54', '2025-10-17 23:46:25', '2025-10-18 00:39:54'),
(9, 'USR-00009', 'Debug User', 'debug@example.com', 0, NULL, '$2a$12$epfxSR1/J9ceJT9BHgMmi./L5ueiImhmi/eZ7tane3qIQMLDNAK0S', NULL, 'Active', 3, 'admin', NULL, '2025-10-17 23:54:52', '2025-10-19 22:47:02'),
(10, 'USR-00010', 'Test Customer', 'customer@example.com', 0, NULL, '$2a$12$jqf4DQoOqdbs1kE9n8MBy.SGkv6A0pPXsTRjKkHBhlfkCgwf0/9Ee', NULL, 'Active', 4, 'customer', NULL, '2025-10-18 00:05:33', '2025-10-18 00:05:33'),
(11, 'USR-00011', 'Test Customer 2', 'customer2@example.com', 1, '2025-10-18 00:07:17', '$2a$12$nhmHuTfrfRxVS5aR/3M6TeOS.3uYXqEbsGB6s/LyuxNiYDso1ec4y', NULL, 'Active', 4, 'customer', '2025-10-18 00:07:17', '2025-10-18 00:07:14', '2025-10-18 00:07:17'),
(13, 'USR-00013', 'Zarafeet', 'info@zarafet.uk', 0, NULL, '$2a$12$3PFJ0in2wOk7HcqQn0dJLOQ9bFJkVYZWCb8yQgHWuX6Zd14XF9uSS', '03048000000', 'Active', 2, 'admin', '2025-10-19 23:24:40', '2025-10-19 23:23:42', '2025-10-19 23:24:40'),
(15, 'USR-00015', 'Mian razman', 'enablecoding@gmail.com', 1, '2025-10-22 23:06:32', '$2a$12$z/bSERxMHNG6259gBdPDJe3Eh.wwtlcoI.Ev32kBVnfa4Xp7d13Gu', NULL, 'Active', 4, 'customer', '2025-10-22 23:06:50', '2025-10-22 21:47:34', '2025-10-22 23:06:50');

-- --------------------------------------------------------

--
-- Table structure for table `user_loyalty_promos`
--

CREATE TABLE `user_loyalty_promos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `promo_code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `discount_value` decimal(10,2) DEFAULT 10.00,
  `status` enum('active','used','expired') DEFAULT 'active',
  `generated_after_order_id` int(11) DEFAULT NULL,
  `used_on_order_id` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_loyalty_promos`
--

INSERT INTO `user_loyalty_promos` (`id`, `user_id`, `promo_code`, `discount_type`, `discount_value`, `status`, `generated_after_order_id`, `used_on_order_id`, `expires_at`, `created_at`, `updated_at`) VALUES
(9, 5, 'LOYALTY-005-mh5f9hnq', 'percentage', 10.00, 'active', 1003, NULL, '2026-10-25 03:27:57', '2025-10-24 22:27:57', '2025-10-24 22:27:57');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(12, 5, 21, '2025-10-25 15:02:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_city` (`city`);

--
-- Indexes for table `applied_discounts`
--
ALTER TABLE `applied_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `discount_type_value_id` (`discount_type_value_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `status` (`status`),
  ADD KEY `sort_order` (`sort_order`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `customer_profiles`
--
ALTER TABLE `customer_profiles`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `tier_value_id` (`tier_value_id`),
  ADD KEY `idx_customers_last_order` (`last_order_at`);

--
-- Indexes for table `lookup_headers`
--
ALTER TABLE `lookup_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `lookup_values`
--
ALTER TABLE `lookup_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `parent_value_id` (`parent_value_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_lookup_values_header` (`header_id`),
  ADD KEY `idx_lookup_values_status` (`status`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status_value_id` (`status_value_id`),
  ADD KEY `payment_method_value_id` (`payment_method_value_id`),
  ADD KEY `idx_orders_created` (`created_at`),
  ADD KEY `fk_orders_payment_id` (`payment_id`),
  ADD KEY `idx_promo_code_id` (`promo_code_id`),
  ADD KEY `idx_promo_code_used` (`promo_code_used`);

--
-- Indexes for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `from_status_value_id` (`from_status_value_id`),
  ADD KEY `to_status_value_id` (`to_status_value_id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_reason` (`reason`(100));

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `email` (`email`),
  ADD KEY `otp_code` (`otp_code`),
  ADD KEY `expires_at` (`expires_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stripe_payment_intent` (`stripe_payment_intent_id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `category_value_id` (`category_value_id`),
  ADD KEY `idx_products_status` (`status`,`stock_status`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expiry_date` (`expiry_date`);

--
-- Indexes for table `recently_viewed`
--
ALTER TABLE `recently_viewed`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product_order` (`user_id`,`product_id`,`order_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_role_name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `method_value_id` (`method_value_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `email` (`email`) USING BTREE,
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_email_user_type` (`email`,`user_type`);

--
-- Indexes for table `user_loyalty_promos`
--
ALTER TABLE `user_loyalty_promos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promo_code` (`promo_code`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_promo_code` (`promo_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_wishlist` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `applied_discounts`
--
ALTER TABLE `applied_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lookup_headers`
--
ALTER TABLE `lookup_headers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `lookup_values`
--
ALTER TABLE `lookup_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `order_addresses`
--
ALTER TABLE `order_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=270;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `recently_viewed`
--
ALTER TABLE `recently_viewed`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user_loyalty_promos`
--
ALTER TABLE `user_loyalty_promos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `applied_discounts`
--
ALTER TABLE `applied_discounts`
  ADD CONSTRAINT `applied_discounts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applied_discounts_ibfk_2` FOREIGN KEY (`discount_type_value_id`) REFERENCES `lookup_values` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `categories_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_profiles`
--
ALTER TABLE `customer_profiles`
  ADD CONSTRAINT `customer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_profiles_ibfk_2` FOREIGN KEY (`tier_value_id`) REFERENCES `lookup_values` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lookup_values`
--
ALTER TABLE `lookup_values`
  ADD CONSTRAINT `lookup_values_ibfk_1` FOREIGN KEY (`header_id`) REFERENCES `lookup_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lookup_values_ibfk_2` FOREIGN KEY (`parent_value_id`) REFERENCES `lookup_values` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lookup_values_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_promo_code` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`status_value_id`) REFERENCES `lookup_values` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`payment_method_value_id`) REFERENCES `lookup_values` (`id`);

--
-- Constraints for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD CONSTRAINT `fk_order_addresses_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`from_status_value_id`) REFERENCES `lookup_values` (`id`),
  ADD CONSTRAINT `order_status_history_ibfk_3` FOREIGN KEY (`to_status_value_id`) REFERENCES `lookup_values` (`id`),
  ADD CONSTRAINT `order_status_history_ibfk_4` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_value_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recently_viewed`
--
ALTER TABLE `recently_viewed`
  ADD CONSTRAINT `recently_viewed_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recently_viewed_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`method_value_id`) REFERENCES `lookup_values` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_loyalty_promos`
--
ALTER TABLE `user_loyalty_promos`
  ADD CONSTRAINT `user_loyalty_promos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;
