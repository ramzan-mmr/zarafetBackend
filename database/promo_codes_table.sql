-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    expiry_date DATETIME NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date)
);

-- Insert some sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, status, description) VALUES
('WELCOME10', 'percentage', 10.00, 'active', 'Welcome discount - 10% off'),
('SAVE20', 'percentage', 20.00, 'active', 'Save 20% on your order'),
('FREESHIP', 'fixed', 5.00, 'active', 'Free shipping discount'),
('NEWUSER', 'percentage', 15.00, 'active', 'New user discount - 15% off'),
('HOLIDAY25', 'percentage', 25.00, 'inactive', 'Holiday special - 25% off (expired)');
