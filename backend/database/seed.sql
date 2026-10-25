-- =============================================================================
-- StyleHub - Seed Data
-- Database: stylehub_db
-- =============================================================================

USE stylehub_db;

-- -----------------------------------------------------------------------------
-- Default Admin Account:
-- Email: admin@stylehub.store | Password: admin123
-- Bcrypt Hash ($2a$10$wT2B1tJ.o7yvHk.YqO8KueRk5C9m0N0cWjVbA8U7kS5Z7wG3tMh7W)
-- -----------------------------------------------------------------------------
INSERT INTO admin_users (username, email, password_hash)
VALUES (
  'admin',
  'admin@stylehub.store',
  '$2a$10$Q4u8Q5W.L53rP5rI7FshzeFk9xH7wI9pI0gYv0xXjXwzL2eE6g9gW'
) ON DUPLICATE KEY UPDATE email=email;

-- -----------------------------------------------------------------------------
-- Initial Clothing Products
-- -----------------------------------------------------------------------------
INSERT INTO products (name, description, price, original_price, category, gender, sizes, color, image_url, stock, is_featured, is_new)
VALUES
(
  'Classic Oxford Cotton Shirt',
  'Tailored from breathable 100% Egyptian cotton, this button-down shirt offers timeless elegance for work or weekend styling.',
  49.99,
  69.99,
  'shirts',
  'men',
  'S,M,L,XL',
  'Sky Blue',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
  24,
  TRUE,
  FALSE
),
(
  'Floral Wrap Midi Dress',
  'Flowing lightweight crepe fabric with a flattering V-neckline, waist tie belt, and charming botanical print for sunny days.',
  64.50,
  85.00,
  'dresses',
  'women',
  'XS,S,M,L',
  'Blush Floral',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80',
  18,
  TRUE,
  TRUE
),
(
  'Heavyweight Boxy Crewneck T-Shirt',
  'Made from 240 GSM organic ring-spun cotton. Features a relaxed drop-shoulder cut and durable ribbed collar.',
  28.00,
  35.00,
  't-shirts',
  'men',
  'S,M,L,XL,XXL',
  'Charcoal Black',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
  45,
  TRUE,
  FALSE
),
(
  'Ribbed Knit Sleeveless Top',
  'Soft viscose blend ribbed tank top with a high neckline. Perfect layering essential for all seasons.',
  24.99,
  32.00,
  'tops',
  'women',
  'XS,S,M,L',
  'Cream Ivory',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80',
  30,
  FALSE,
  TRUE
),
(
  'Slim-Fit Selvedge Denim Jeans',
  'Crafted from 13.5oz Japanese stretch selvedge denim. Clean wash with custom copper hardware and 5-pocket design.',
  79.99,
  99.99,
  'jeans',
  'men',
  '30,32,34,36',
  'Deep Indigo',
  'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80',
  22,
  TRUE,
  FALSE
),
(
  'High-Rise Straight Leg Denim',
  'Vintage inspired 90s silhouette cut from structured denim with a flattering high waist and ankle grazing hem.',
  69.00,
  89.00,
  'jeans',
  'women',
  '26,28,30,32',
  'Vintage Light Blue',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
  15,
  TRUE,
  TRUE
),
(
  'Vintage Biker Leather Jacket',
  'Premium full-grain synthetic leather jacket featuring silver hardware, asymmetric zipper, and satin lining.',
  119.00,
  150.00,
  'jackets',
  'women',
  'S,M,L',
  'Midnight Black',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
  12,
  TRUE,
  TRUE
),
(
  'Urban Utility Bomber Jacket',
  'Water-resistant nylon outer shell with thermal quilting, sleeve utility pocket, and ribbed athletic trims.',
  95.00,
  125.00,
  'jackets',
  'men',
  'M,L,XL',
  'Olive Green',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
  16,
  FALSE,
  TRUE
),
(
  'Pleated Tailored Trousers',
  'Sophisticated wide-leg cut with front pleats, slant pockets, and a clean belt-looped waistband.',
  58.00,
  75.00,
  'pants',
  'women',
  'XS,S,M,L',
  'Warm Taupe',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80',
  20,
  FALSE,
  FALSE
),
(
  'Chino Relaxed Pants',
  'Durable stretch cotton twill pants tailored for daily comfort, office wear, or casual outings.',
  48.00,
  60.00,
  'pants',
  'men',
  '30,32,34,36',
  'Khaki Tan',
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80',
  28,
  FALSE,
  FALSE
);
