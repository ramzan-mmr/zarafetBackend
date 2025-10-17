-- Simple query to insert Order Status values for header ID 20
-- Run this query to add all standard order statuses

INSERT INTO `lookup_values` (
    `code`, 
    `header_id`, 
    `value`, 
    `description`, 
    `status`, 
    `order`, 
    `parent_value_id`, 
    `created_at`, 
    `created_by`
) VALUES 
('LV-00028', 20, 'Processing', 'Order is being processed', 'Active', 2, NULL, NOW(), 1),
('LV-00029', 20, 'Shipped', 'Order has been shipped', 'Active', 3, NULL, NOW(), 1),
('LV-00030', 20, 'Delivered', 'Order has been delivered', 'Active', 4, NULL, NOW(), 1),
('LV-00031', 20, 'Cancelled', 'Order has been cancelled', 'Active', 5, NULL, NOW(), 1),
('LV-00032', 20, 'Refunded', 'Order has been refunded', 'Active', 6, NULL, NOW(), 1),
('LV-00033', 20, 'Returned', 'Order has been returned', 'Active', 7, NULL, NOW(), 1);

-- Update existing Pending status to have order = 1
UPDATE `lookup_values` 
SET `order` = 1 
WHERE `header_id` = 20 AND `value` = 'Pending';

-- Show all order status values
SELECT 
    id,
    code,
    value,
    description,
    `order`,
    status
FROM `lookup_values` 
WHERE `header_id` = 20 
ORDER BY `order` ASC;
