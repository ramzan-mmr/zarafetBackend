-- Add fit field to order_items table to store selected fit
ALTER TABLE order_items 
ADD COLUMN selected_fit VARCHAR(50) NULL COMMENT 'Fit selected by customer for this order item';
