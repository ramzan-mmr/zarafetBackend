-- Complete lookup values insertion for all headers
-- This script inserts all necessary lookup values for a complete e-commerce system

-- ============================================
-- ORDER STATUS VALUES (Header ID: 20)
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00028', 20, 'Processing', 'Order is being processed', 'Active', 2, NULL, NOW(), 1),
('LV-00029', 20, 'Shipped', 'Order has been shipped', 'Active', 3, NULL, NOW(), 1),
('LV-00030', 20, 'Delivered', 'Order has been delivered', 'Active', 4, NULL, NOW(), 1),
('LV-00031', 20, 'Cancelled', 'Order has been cancelled', 'Active', 5, NULL, NOW(), 1),
('LV-00032', 20, 'Refunded', 'Order has been refunded', 'Active', 6, NULL, NOW(), 1),
('LV-00033', 20, 'Returned', 'Order has been returned', 'Active', 7, NULL, NOW(), 1);

-- ============================================
-- PAYMENT METHODS (Header ID: 6) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00035', 6, 'Credit Card', 'Credit card payment', 'Active', 1, NULL, NOW(), 1),
('LV-00036', 6, 'Debit Card', 'Debit card payment', 'Active', 2, NULL, NOW(), 1),
('LV-00037', 6, 'PayPal', 'PayPal payment', 'Active', 3, NULL, NOW(), 1),
('LV-00038', 6, 'Apple Pay', 'Apple Pay payment', 'Active', 4, NULL, NOW(), 1),
('LV-00039', 6, 'Google Pay', 'Google Pay payment', 'Active', 5, NULL, NOW(), 1),
('LV-00040', 6, 'Bank Transfer', 'Bank transfer payment', 'Active', 6, NULL, NOW(), 1),
('LV-00041', 6, 'Cash on Delivery', 'Cash on delivery payment', 'Active', 7, NULL, NOW(), 1);

-- ============================================
-- SHIPMENT METHODS (Header ID: 9) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00042', 9, 'Standard Shipping', 'Standard shipping method', 'Active', 1, NULL, NOW(), 1),
('LV-00043', 9, 'Express Shipping', 'Express shipping method', 'Active', 2, NULL, NOW(), 1),
('LV-00044', 9, 'Overnight Shipping', 'Overnight shipping method', 'Active', 3, NULL, NOW(), 1),
('LV-00045', 9, 'Free Shipping', 'Free shipping method', 'Active', 4, NULL, NOW(), 1),
('LV-00046', 9, 'Pickup', 'Store pickup', 'Active', 5, NULL, NOW(), 1);

-- ============================================
-- DISCOUNT TYPES (Header ID: 10) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00047', 10, 'Percentage Discount', 'Percentage-based discount', 'Active', 1, NULL, NOW(), 1),
('LV-00048', 10, 'Fixed Amount Discount', 'Fixed amount discount', 'Active', 2, NULL, NOW(), 1),
('LV-00049', 10, 'Free Shipping', 'Free shipping discount', 'Active', 3, NULL, NOW(), 1),
('LV-00050', 10, 'Buy One Get One', 'Buy one get one free', 'Active', 4, NULL, NOW(), 1),
('LV-00051', 10, 'First Order', 'First order discount', 'Active', 5, NULL, NOW(), 1);

-- ============================================
-- CUSTOMER TYPES (Header ID: 8) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00052', 8, 'Regular Customer', 'Regular customer type', 'Active', 1, NULL, NOW(), 1),
('LV-00053', 8, 'VIP Customer', 'VIP customer type', 'Active', 2, NULL, NOW(), 1),
('LV-00054', 8, 'Wholesale Customer', 'Wholesale customer type', 'Active', 3, NULL, NOW(), 1),
('LV-00055', 8, 'Corporate Customer', 'Corporate customer type', 'Active', 4, NULL, NOW(), 1);

-- ============================================
-- PRODUCT SIZES (Header ID: 3) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00056', 3, 'XS', 'Extra Small size', 'Active', 1, NULL, NOW(), 1),
('LV-00057', 3, 'S', 'Small size', 'Active', 2, NULL, NOW(), 1),
('LV-00058', 3, 'M', 'Medium size', 'Active', 3, NULL, NOW(), 1),
('LV-00059', 3, 'L', 'Large size', 'Active', 4, NULL, NOW(), 1),
('LV-00060', 3, 'XL', 'Extra Large size', 'Active', 5, NULL, NOW(), 1),
('LV-00061', 3, 'XXL', 'Double Extra Large size', 'Active', 6, NULL, NOW(), 1),
('LV-00062', 3, 'XXXL', 'Triple Extra Large size', 'Active', 7, NULL, NOW(), 1);

-- ============================================
-- COLORS (Header ID: 4) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00063', 4, 'Black', 'Black color', 'Active', 1, NULL, NOW(), 1),
('LV-00064', 4, 'White', 'White color', 'Active', 2, NULL, NOW(), 1),
('LV-00065', 4, 'Red', 'Red color', 'Active', 3, NULL, NOW(), 1),
('LV-00066', 4, 'Blue', 'Blue color', 'Active', 4, NULL, NOW(), 1),
('LV-00067', 4, 'Green', 'Green color', 'Active', 5, NULL, NOW(), 1),
('LV-00068', 4, 'Yellow', 'Yellow color', 'Active', 6, NULL, NOW(), 1),
('LV-00069', 4, 'Purple', 'Purple color', 'Active', 7, NULL, NOW(), 1),
('LV-00070', 4, 'Pink', 'Pink color', 'Active', 8, NULL, NOW(), 1),
('LV-00071', 4, 'Orange', 'Orange color', 'Active', 9, NULL, NOW(), 1),
('LV-00072', 4, 'Brown', 'Brown color', 'Active', 10, NULL, NOW(), 1),
('LV-00073', 4, 'Gray', 'Gray color', 'Active', 11, NULL, NOW(), 1),
('LV-00074', 4, 'Navy', 'Navy color', 'Active', 12, NULL, NOW(), 1);

-- ============================================
-- BRANDS (Header ID: 2) - if exists
-- ============================================
INSERT INTO `lookup_values` (
    `code`, `header_id`, `value`, `description`, `status`, `order`, `parent_value_id`, `created_at`, `created_by`
) VALUES 
('LV-00075', 2, 'Zarafet', 'Zarafet brand', 'Active', 1, NULL, NOW(), 1),
('LV-00076', 2, 'Nike', 'Nike brand', 'Active', 2, NULL, NOW(), 1),
('LV-00077', 2, 'Adidas', 'Adidas brand', 'Active', 3, NULL, NOW(), 1),
('LV-00078', 2, 'Puma', 'Puma brand', 'Active', 4, NULL, NOW(), 1),
('LV-00079', 2, 'Under Armour', 'Under Armour brand', 'Active', 5, NULL, NOW(), 1);

-- Update existing Pending status order to 1 for proper sequencing
UPDATE `lookup_values` 
SET `order` = 1 
WHERE `header_id` = 20 AND `value` = 'Pending';

-- Verify all insertions
SELECT 
    lh.name as header_name,
    lv.id,
    lv.code,
    lv.value,
    lv.description,
    lv.`order`,
    lv.status,
    lv.created_at
FROM `lookup_values` lv
JOIN `lookup_headers` lh ON lv.header_id = lh.id
WHERE lv.header_id IN (2, 3, 4, 6, 8, 9, 10, 20)
ORDER BY lv.header_id, lv.`order` ASC;
