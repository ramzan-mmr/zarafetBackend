-- Add fit options to products table
-- This migration adds fit-related fields to support different clothing fits

-- Add fit fields to products table
ALTER TABLE products 
ADD COLUMN fit_options TEXT NULL COMMENT 'Available fit options for the product (JSON string)',
ADD COLUMN default_fit VARCHAR(50) NULL COMMENT 'Default fit option',
ADD COLUMN fit_required BOOLEAN DEFAULT FALSE COMMENT 'Whether fit selection is required for this product';