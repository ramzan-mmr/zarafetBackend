-- Insert common fit options
INSERT INTO lookup_values (header_id, value, description) VALUES 
((SELECT id FROM lookup_headers WHERE name = 'Product Fit'), 'Standard Fit', 'Regular standard fit'),
((SELECT id FROM lookup_headers WHERE name = 'Product Fit'), 'Slim Fit', 'Tighter, more fitted silhouette'),
((SELECT id FROM lookup_headers WHERE name = 'Product Fit'), 'Loose Fit', 'Relaxed, comfortable fit'),
((SELECT id FROM lookup_headers WHERE name = 'Product Fit'), 'Oversized', 'Larger, relaxed fit'),
((SELECT id FROM lookup_headers WHERE name = 'Product Fit'), 'Fitted', 'Close to body fit'),
((SELECT id FROM lookup_headers WHERE name = 'Product Fit'), 'Relaxed Fit', 'Comfortable, not tight')
ON DUPLICATE KEY UPDATE description = VALUES(description);
