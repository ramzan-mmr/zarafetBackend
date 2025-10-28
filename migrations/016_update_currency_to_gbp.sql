-- Migration to update currency from USD to GBP
-- This migration updates existing payment records and sets default currency to GBP

-- Update existing payment records to use GBP
UPDATE payments SET currency = 'gbp' WHERE currency = 'usd';

-- Update the default currency in the payments table
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'gbp';

-- Add comment to document the change
ALTER TABLE payments COMMENT = 'Payments table - currency default changed from USD to GBP';
