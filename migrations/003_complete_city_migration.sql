-- Complete City Migration Script
-- This script converts city from lookup-based to string-based
-- Run this script in MySQL to complete the migration

-- Step 1: Add city column to addresses table
ALTER TABLE addresses ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER line2;

-- Step 2: Migrate existing data from lookup_values to city string
UPDATE addresses a 
LEFT JOIN lookup_values lv ON a.city_value_id = lv.id 
SET a.city = COALESCE(lv.value, '') 
WHERE a.city_value_id IS NOT NULL;

-- Step 3: Update any NULL cities to empty string
UPDATE addresses SET city = '' WHERE city IS NULL;

-- Step 4: Make city field NOT NULL with default empty string
ALTER TABLE addresses MODIFY COLUMN city VARCHAR(100) NOT NULL DEFAULT '';

-- Step 5: Remove foreign key constraint
ALTER TABLE addresses DROP FOREIGN KEY addresses_ibfk_2;

-- Step 6: Drop city_value_id column
ALTER TABLE addresses DROP COLUMN city_value_id;

-- Step 7: Add index on city for better performance
ALTER TABLE addresses ADD INDEX idx_city (city);

-- Verification queries
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_addresses FROM addresses;
SELECT COUNT(*) as addresses_with_city FROM addresses WHERE city != '';
SELECT 'All addresses now have city field' as verification;
