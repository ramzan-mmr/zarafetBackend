-- Add promo code fields to orders table
ALTER TABLE orders 
ADD COLUMN promo_code_id INT NULL,
ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN promo_code_used VARCHAR(50) NULL,
ADD INDEX idx_promo_code_id (promo_code_id),
ADD INDEX idx_promo_code_used (promo_code_used);

-- Add foreign key constraint to promo_codes table
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_promo_code 
FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) 
ON DELETE SET NULL;
