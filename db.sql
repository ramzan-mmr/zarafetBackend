-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2025 at 08:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

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
  `city_value_id` int(11) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `label`, `line1`, `line2`, `city_value_id`, `postal_code`, `phone`, `is_default`) VALUES
(3, 5, 'HOME', '123 Main Street', 'Apt 4B', NULL, '12345', '+1234567890', 1),
(8, 5, 'Apartment', '123 Complex Ave', 'Unit 4B', 26, '11111', '+1111111111', 0),
(11, 6, 'asdfa', '2342', '234', 26, '23423', '234234234', 0);

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
(6, 'CAT-00006', 'Abayas', 'Traditional Islamic garments for women', NULL, NULL, 2, 'Active', '2025-10-08 22:07:30', '2025-10-08 22:07:30', 1),
(7, 'CAT-00007', 'babies', 'Clothing and accessories for infants and babies', NULL, NULL, 3, 'Active', '2025-10-08 22:07:30', '2025-10-08 22:07:30', 1),
(8, 'CAT-00008', 'children', 'Clothing and accessories for children', NULL, NULL, 4, 'Active', '2025-10-08 22:07:30', '2025-10-08 22:07:30', 1),
(9, 'CAT-00009', 'Dresses', 'Various styles of dresses for women', NULL, NULL, 5, 'Active', '2025-10-08 22:07:30', '2025-10-08 22:07:30', 1),
(10, 'CAT-00010', 'women', 'General category for women\'s apparel and accessories', NULL, NULL, 6, 'Active', '2025-10-08 22:07:30', '2025-10-08 22:07:30', 1);

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
(6, 0, 0.00, 0, NULL, '2025-10-07', NULL);

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
(7, 'LH-00007', 'City', 'city', NULL, 'Custom', 'Active', '2025-09-26 01:51:18'),
(8, 'LH-00008', 'productCategory', 'Product Category', NULL, 'Custom', 'Active', '2025-09-28 23:24:34');

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
(26, 'LV-00026', 7, 'asdfad', 'asdfasd', 'Active', 1, NULL, '2025-10-02 04:47:36', 1);

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
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `changed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage calculated automatically'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `code`, `sku`, `name`, `description`, `category_value_id`, `price`, `stock`, `stock_status`, `status`, `date_added`, `created_at`, `updated_at`, `original_price`, `current_price`, `discount_percentage`) VALUES
(2, 'PRD-00002', 'SKU-MG7U0TUT-QYB84', 'Testing product', 'fldsjafldsa fldsa dsadsa', 6, 300.00, 0, 'Out of Stock', 'Active', '2025-10-01', '2025-10-01 15:16:57', '2025-10-08 23:10:09', 400.00, 300.00, 25.00),
(3, 'PRD-00003', 'SKU-MG7U19CV-J6KV2', 'Testing product', 'fldsjafldsa fldsa dsadsa', 8, 300.00, 0, 'Out of Stock', 'Active', '2025-10-01', '2025-10-01 15:17:17', '2025-10-08 23:10:17', 400.00, 300.00, 25.00),
(4, 'PRD-00004', 'TESTING-6AFC6CA2', 'Testing', 'afdsasihT', 8, 300.00, 30, 'Active', 'Active', '2025-10-01', '2025-10-01 15:28:31', '2025-10-08 23:09:59', 400.00, 300.00, 25.00),
(5, 'PRD-00005', 'THIS-TESTING-9953ACED', 'Updated Product', 'Updated description', 6, 23.00, 0, 'Out of Stock', 'Active', '2025-10-01', '2025-10-01 15:30:13', '2025-10-08 23:10:51', 33.00, 23.00, 30.30),
(7, 'PRD-00007', 'BSA-UK1EOAFS', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:36:24', '2025-10-08 22:53:30', 60.00, 50.00, 16.67),
(8, 'PRD-00008', 'BSA-GWNWXIXD', 'Black SIlk Abaya', 'fdslafkdsa', 7, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:36:51', '2025-10-08 22:53:48', 60.00, 50.00, 16.67),
(9, 'PRD-00009', 'BSA-H1IWRY2D', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:37:32', '2025-10-08 23:08:08', 60.00, 50.00, 16.67),
(10, 'PRD-00010', 'BSA-D305YAO0', 'Black SIlk Abaya', 'fdslafkdsa', 8, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:00', '2025-10-08 23:08:15', 60.00, 50.00, 16.67),
(11, 'PRD-00011', 'BSA-FT1GNCS4', 'Black SIlk Abaya', 'fdslafkdsa', 9, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:04', '2025-10-08 23:08:22', 60.00, 50.00, 16.67),
(12, 'PRD-00012', 'BSA-8TT2D302', 'Black SIlk Abaya', 'fdslafkdsa', 9, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:04', '2025-10-08 23:08:30', 60.00, 50.00, 16.67),
(13, 'PRD-00013', 'BSA-J6CFUPPP', 'Black SIlk Abaya', 'fdslafkdsa', 10, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:05', '2025-10-08 23:08:47', 60.00, 50.00, 16.67),
(14, 'PRD-00014', 'BSA-5GT87547', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:07', '2025-10-08 23:08:59', 60.00, 50.00, 16.67),
(15, 'PRD-00015', 'BSA-4AVCILJU', 'Black SIlk Abaya ......', 'fdslafkdsa', 7, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:07', '2025-10-08 23:09:50', 60.00, 50.00, 16.67),
(16, 'PRD-00016', 'BSA-ZK6EFBXR', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:07', '2025-10-08 23:09:12', 60.00, 50.00, 16.67),
(17, 'PRD-00017', 'BSA-M1L63XBK', 'Black SIlk Abaya', 'fdslafkdsa', 6, 50.00, 40, 'Active', 'Active', '2025-10-01', '2025-10-01 15:38:11', '2025-10-08 23:09:19', 60.00, 50.00, 16.67),
(19, 'PRD-00019', 'A-2WIMT3N0', 'Updated Test Product', '3333333333333333333333333333333', 7, 25.00, 234, 'Active', 'Active', '2025-10-02', '2025-10-02 01:30:18', '2025-10-08 23:00:45', 10.00, 23.00, NULL),
(20, 'PRD-00020', 'A-61FVUKBD', 'asdfasd', 'a', 6, 234.00, 23, 'Active', 'Active', '2025-10-08', '2025-10-08 23:12:27', '2025-10-08 23:12:27', 2344.00, 234.00, 90.02);

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
(111, 19, 'http://localhost:3000/uploads/products/19/mg8hhnm1-dc8a0bb52264efef.jpg', 1),
(112, 19, 'http://localhost:3000/uploads/products/19/mg8hhnm6-16fc4f0336c195c4.jpg', 2),
(113, 19, 'http://localhost:3000/uploads/products/19/mg8hhnm7-ce8b3be468dd3cab.jpg', 3),
(114, 19, 'http://localhost:3000/uploads/products/19/mg8mv81g-98115437a5d0b59b.jpg', 4),
(115, 7, 'http://localhost:3000/uploads/products/7/mgiaewpi-1eaa9929c4d4e2fa.jpg', 1),
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
(204, 3, 'http://localhost:3000/uploads/products/3/mg7u19d1-838a7aebfa921fae.jpg', 1),
(205, 3, 'http://localhost:3000/uploads/products/3/mg7u19d2-ee1882a2d373325e.jpg', 2),
(206, 3, 'http://localhost:3000/uploads/products/3/mg7u19d3-f9f6f5d7d425ebdb.jpg', 3),
(207, 3, 'http://localhost:3000/uploads/products/3/mg7u19d4-f6f39610a330f938.jpg', 4),
(208, 3, 'http://localhost:3000/uploads/products/3/mg7u19d4-8e4276062dd3d3d0.jpg', 5),
(209, 5, 'http://localhost:3000/uploads/products/5/mgib181o-de266ec74ea63cfb.jpg', 1),
(210, 5, 'http://localhost:3000/uploads/products/5/mgib181r-7329ba6d6ec78d8b.jpg', 2),
(211, 5, 'http://localhost:3000/uploads/products/5/mgib181t-831b0018a82397e7.jpg', 3),
(212, 5, 'http://localhost:3000/uploads/products/5/mgib181v-8405810053d8fa64.jpg', 4),
(213, 20, 'http://localhost:3000/uploads/products/20/mgib3aan-ccd5bea86a39c0f5.jpg', 1),
(214, 20, 'http://localhost:3000/uploads/products/20/mgib3aar-d5bf4a50b8eb7a4f.jpg', 2),
(215, 20, 'http://localhost:3000/uploads/products/20/mgib3aat-9ea9b38a2fa45630.jpg', 3),
(216, 20, 'http://localhost:3000/uploads/products/20/mgib3aav-f13369f26cdc27c6.jpg', 4);

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
(39, 19, 'ASDFASDFAS-S-asdfasd', 0.00, 777, 'S', 'asdfasd', '#000000', ''),
(40, 19, 'ASDFASDFAS-M-Blue', 25.00, 23, 'M', 'Blue', '#087fba', ''),
(45, 13, 'BLACK-SILK-ABAYA-S-Black', 0.00, 234, 'S', 'Black', '#000000', ''),
(49, 15, 'BLACK-SILK-ABAYA-......-S-Black', 0.00, 234, 'S', 'Black', '#000000', ''),
(50, 4, 'TESTING-S-Black', 0.00, 10, 'S', 'Black', '#000000', ''),
(51, 2, 'TESTING-PRODUCT-S-Black', 0.00, 23, 'S', 'Black', '#000000', ''),
(52, 20, 'ASDFASD-M-sdfgs', 34.00, 34, 'M', 'sdfgs', '#000000', '');

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

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `role_id` int(11) NOT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `code`, `name`, `email`, `password_hash`, `phone`, `status`, `role_id`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'USR-001', 'Super Admin', 'mianmuhammadramzan99@gmail.com', '$2a$12$C3bCmrWuEyLoPHlSNoDHAOehqrSe7TVVGeu.BFSRCZPa/.87Y7iwm', '03048108665', 'Active', 1, '2025-10-08 00:09:35', '2025-09-23 23:51:29', '2025-10-08 00:09:35'),
(2, 'USR-00002', 'Test User', 'test@example.com', '$2a$12$/YLz8HAeJjffd88EKmfYwuaEwX.moo40zzDR5.0La2/Ds7kx/MwSy', NULL, 'Active', 4, '2025-10-02 03:26:10', '2025-10-02 03:26:02', '2025-10-02 03:26:10'),
(3, 'USR-00003', 'Updated Ramzan', 'ramzan@gmail.com', '$2a$12$MsxReESVq3d5NV5Rx7EQzOzOqD3UIp9bNs2UjPw8dyPXp9uDGcAym', '+1234567890', 'Active', 4, '2025-10-02 04:53:17', '2025-10-02 03:26:49', '2025-10-02 04:53:17'),
(5, 'USR-00005', 'Mian Muhammad Ramzan', 'jani@gmail.com', '$2a$12$P89iVMo8cbmRb8ytJXvpvuYqzTdLBlHBoT.5CuYFGcC0z/UV7/qBy', NULL, 'Active', 4, '2025-10-04 00:42:23', '2025-10-03 22:51:42', '2025-10-04 00:42:23'),
(6, 'USR-00006', 'asdfasdf', 'test2@gmail.com', '$2a$12$7H1mG0Rw4ZCwZDMBkUkxzOBEnNQMuu4x97ijGkvlZZ/fAAgWmhNGG', NULL, 'Active', 4, NULL, '2025-10-07 00:06:51', '2025-10-07 00:06:51');

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
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `city_value_id` (`city_value_id`);

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
  ADD KEY `idx_orders_created` (`created_at`);

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
  ADD KEY `changed_by` (`changed_by`);

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
-- Indexes for table `recently_viewed`
--
ALTER TABLE `recently_viewed`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

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
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `role_id` (`role_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `lookup_values`
--
ALTER TABLE `lookup_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=217;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `recently_viewed`
--
ALTER TABLE `recently_viewed`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `addresses_ibfk_2` FOREIGN KEY (`city_value_id`) REFERENCES `lookup_values` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`status_value_id`) REFERENCES `lookup_values` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`payment_method_value_id`) REFERENCES `lookup_values` (`id`);

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
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
