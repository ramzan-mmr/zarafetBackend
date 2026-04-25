-- Discount Popups table for managing homepage discount popup banners
-- Only 1 active popup at a time enforced at application level

CREATE TABLE IF NOT EXISTS discount_popups (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(200) NOT NULL,
  image_url varchar(500) NOT NULL,
  status enum('Active','Inactive') DEFAULT 'Active',
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  created_by int(11) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY created_by (created_by),
  CONSTRAINT discount_popups_ibfk_1 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
