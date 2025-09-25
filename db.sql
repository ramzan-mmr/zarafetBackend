-- ================= USERS & ROLES =================
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,                 -- RL-001 (UI)
  name ENUM('Admin','Manager','Staff') NOT NULL,
  description TEXT,
  level TINYINT DEFAULT 3,                 -- optional for “Level 1/2/3” badge
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional granular permissions (keep if you want “permissions” column in Roles screen)
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,       -- e.g., products.view, products.edit
  description TEXT
);

CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,                 -- USR-001 (for UI)
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  status ENUM('Active','Inactive') DEFAULT 'Active',
  role_id INT NOT NULL,                    -- Admin / Manager / Staff
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ================= LOOKUPS (HEADERS + VALUES) =================
CREATE TABLE lookup_headers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,                 -- LH-001
  name VARCHAR(120) NOT NULL,              -- Product Categories, Cities, Order Status, Payment Methods, Brands, Sizes, etc.
  description TEXT,
  category VARCHAR(60),                    -- Product | Order | Payment | Location | Customer | Promotion
  type ENUM('System','Custom') DEFAULT 'Custom',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lookup_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,                 -- LV-001
  header_id INT NOT NULL,
  value VARCHAR(150) NOT NULL,             -- e.g., Abayas, London, PayPal, Processing
  description TEXT,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  `order` INT DEFAULT 1,
  parent_value_id INT NULL,                -- optional: for hierarchical categories
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  FOREIGN KEY (header_id) REFERENCES lookup_headers(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_lookup_values_header ON lookup_values(header_id);
CREATE INDEX idx_lookup_values_status ON lookup_values(status);

-- ================= CUSTOMERS (STATS for “Customers” grid) =================
CREATE TABLE customer_profiles (
  user_id INT PRIMARY KEY,                 -- only for role=customer users (you can also keep customers in users with role='customer' if you like)
  total_orders INT DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,
  points INT DEFAULT 0,
  tier_value_id INT NULL,                  -- e.g., VIP (from “Customer Types” header)
  reg_date DATE DEFAULT (CURRENT_DATE),
  last_order_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL
);

CREATE TABLE addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label ENUM('HOME','OFFICE') DEFAULT 'HOME',
  line1 VARCHAR(150) NOT NULL,
  line2 VARCHAR(150),
  city_value_id INT NULL,                  -- from Cities
  postal_code VARCHAR(20),
  phone VARCHAR(30),
  is_default TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL
);

-- ================= CATALOG =================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,                 -- internal/UI
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  category_value_id INT NULL,              -- from “Product Categories”
  brand_value_id INT NULL,                 -- from “Brands”
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  stock_status ENUM('Active','Low Stock','Out of Stock') DEFAULT 'Active',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  date_added DATE DEFAULT (CURRENT_DATE),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL,
  FOREIGN KEY (brand_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  `order` INT DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size_value_id INT NULL,                  -- from “Product Sizes”
  color_value_id INT NULL,                 -- (add a “Colors” header if needed)
  sku VARCHAR(50) UNIQUE,
  extra_price DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (size_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL,
  FOREIGN KEY (color_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL
);

-- ================= ORDERS =================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,                 -- ORD-25149
  user_id INT NOT NULL,                    -- customer
  status_value_id INT NOT NULL,            -- from “Order Status”
  payment_method_value_id INT NULL,        -- from “Payment Methods”
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (status_value_id) REFERENCES lookup_values(id),
  FOREIGN KEY (payment_method_value_id) REFERENCES lookup_values(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

CREATE TABLE shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  method_value_id INT NULL,                -- put “Shipment Methods” in lookups if you want
  scheduled_date DATE NULL,                -- when “Schedule” is selected
  cost DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (method_value_id) REFERENCES lookup_values(id) ON DELETE SET NULL
);

CREATE TABLE order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  from_status_value_id INT NULL,
  to_status_value_id INT NOT NULL,
  changed_by INT NULL,                     -- admin user id
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (from_status_value_id) REFERENCES lookup_values(id),
  FOREIGN KEY (to_status_value_id) REFERENCES lookup_values(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- ================= WISHLIST / RECENTLY VIEWED =================
CREATE TABLE wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE recently_viewed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ================= DISCOUNTS (optional) =================
CREATE TABLE applied_discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  discount_type_value_id INT NOT NULL,     -- from “Discount Types”
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (discount_type_value_id) REFERENCES lookup_values(id) ON DELETE RESTRICT
);

-- Helpful indexes
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_products_status ON products(status, stock_status);
CREATE INDEX idx_customers_last_order ON customer_profiles(last_order_at);
