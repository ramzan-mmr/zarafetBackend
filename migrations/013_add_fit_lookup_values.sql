-- Insert fit options as lookup values
INSERT INTO lookup_headers (name, description) VALUES 
('Product Fit', 'Available fit options for clothing products')
ON DUPLICATE KEY UPDATE description = VALUES(description);