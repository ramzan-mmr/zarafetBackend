-- Hero Banners table for managing homepage hero slider banners
-- Max 3 banners enforced at application level

CREATE TABLE IF NOT EXISTS hero_banners (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(200) NOT NULL,
  tagline varchar(500) DEFAULT NULL,
  image_url varchar(500) NOT NULL,
  sort_order int(11) DEFAULT 1,
  status enum('Active','Inactive') DEFAULT 'Active',
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  created_by int(11) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY created_by (created_by),
  KEY sort_order (sort_order),
  CONSTRAINT hero_banners_ibfk_1 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
