-- Insert Order Status lookup values for header ID 20
-- This will add all standard order statuses to the lookup_values table

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
-- Order Status Values (header_id = 20)
('LV-00028', 20, 'Processing', 'Order is being processed', 'Active', 2, NULL, NOW(), 1),
('LV-00029', 20, 'Shipped', 'Order has been shipped', 'Active', 3, NULL, NOW(), 1),
('LV-00030', 20, 'Delivered', 'Order has been delivered', 'Active', 4, NULL, NOW(), 1),
('LV-00031', 20, 'Cancelled', 'Order has been cancelled', 'Active', 5, NULL, NOW(), 1),
('LV-00032', 20, 'Refunded', 'Order has been refunded', 'Active', 6, NULL, NOW(), 1),
('LV-00033', 20, 'Returned', 'Order has been returned', 'Active', 7, NULL, NOW(), 1);

-- Update existing Pending status order to 1 for proper sequencing
UPDATE `lookup_values` 
SET `order` = 1 
WHERE `header_id` = 20 AND `value` = 'Pending';

-- Verify the insertions
SELECT 
    id,
    code,
    value,
    description,
    `order`,
    status,
    created_at
FROM `lookup_values` 
WHERE `header_id` = 20 
ORDER BY `order` ASC;
