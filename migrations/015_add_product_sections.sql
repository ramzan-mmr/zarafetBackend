-- Add product information sections to products table
-- This migration adds fields for Materials & Care, Delivery & Returns, Return & Exchanges, and Contact sections

-- Add section fields to products table
ALTER TABLE products 
ADD COLUMN materials_care TEXT NULL COMMENT 'Materials and care instructions for the product',
ADD COLUMN delivery_returns TEXT NULL COMMENT 'Delivery and returns information',
ADD COLUMN return_exchanges TEXT NULL COMMENT 'Return and exchange policy information',
ADD COLUMN contact_info TEXT NULL COMMENT 'Contact information for product support';

-- Add default values for existing products
UPDATE products SET 
materials_care = 'This product is made from high-quality materials. Please follow the care instructions on the label for best results. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang to dry. Iron on low heat if needed.',
delivery_returns = 'We offer free standard delivery on orders over £50. Standard delivery takes 3-5 business days. Express delivery available for £5.99. Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.',
return_exchanges = 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive your return.',
contact_info = 'For any questions about this product, please contact our customer service team at support@zarafeet.com or call us at +44 20 1234 5678. We are available Monday-Friday 9AM-6PM GMT.'
WHERE materials_care IS NULL;
