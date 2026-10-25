-- =============================================================================
-- StyleHub - Database Schema Definition
-- Database Name: stylehub_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS stylehub_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stylehub_db;

-- -----------------------------------------------------------------------------
-- Table: products
-- Stores clothing items with categorized metadata, sizes, stock, and pricing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) DEFAULT NULL,
  category VARCHAR(50) NOT NULL,
  gender ENUM('men', 'women', 'unisex') NOT NULL,
  sizes VARCHAR(100) NOT NULL COMMENT 'Comma-separated sizes e.g. S,M,L,XL',
  color VARCHAR(50) DEFAULT NULL,
  image_url VARCHAR(500) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_gender (gender),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: admin_users
-- Stores authenticated administrators with bcrypt password hashes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: contact_messages
-- Stores inquiries submitted through the contact form
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
