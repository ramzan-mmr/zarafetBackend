-- Fix shipping method lookup values
-- Add shipping method header
INSERT INTO lookup_headers (id, code, name, description, category, type, status, created_at) 
VALUES (21, 'LH-00021', 'Shipping Method', 'Shipping method options', 'Logistics', 'Custom', 'Active', NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Add shipping method values
INSERT INTO lookup_values (id, code, header_id, value, description, status, `order`, parent_value_id, created_at, created_by) 
VALUES 
(28, 'LV-00028', 21, 'Regular Shipment', 'Standard shipping method', 'Active', 1, NULL, NOW(), 1),
(29, 'LV-00029', 21, 'Express Shipment', 'Fast shipping method', 'Active', 2, NULL, NOW(), 1),
(30, 'LV-00030', 21, 'Overnight Delivery', 'Next day delivery', 'Active', 3, NULL, NOW(), 1)
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Update the shipments table to use the correct method_value_id
-- For now, let's use Regular Shipment (ID 28) as the default
