-- Allow any size value (e.g. 1, 2, 3, 4, 2T, 4T, One Size) instead of ENUM
-- UK/children's sizes and custom sizes were causing "Data truncated for column 'size'"

ALTER TABLE `product_variants`
  MODIFY COLUMN `size` VARCHAR(50) DEFAULT NULL;
