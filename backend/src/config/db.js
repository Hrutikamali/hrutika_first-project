/* ==========================================================================
   StyleHub - Database Connection Configuration
   Uses mysql2/promise with connection pooling & resilient beginner-friendly fallback
   ========================================================================== */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stylehub_db',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

// In-Memory Storage Fallback (Guarantees StyleHub works even before MySQL is started)
const inMemoryStore = {
  products: [
    {
      id: 1,
      name: "Classic Oxford Cotton Shirt",
      description: "Tailored from breathable 100% Egyptian cotton, this button-down shirt offers timeless elegance for work or weekend styling.",
      price: 49.99,
      original_price: 69.99,
      category: "shirts",
      gender: "men",
      sizes: "S,M,L,XL",
      color: "Sky Blue",
      image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80",
      stock: 24,
      is_featured: 1,
      is_new: 0
    },
    {
      id: 2,
      name: "Floral Wrap Midi Dress",
      description: "Flowing lightweight crepe fabric with a flattering V-neckline, waist tie belt, and charming botanical print for sunny days.",
      price: 64.50,
      original_price: 85.00,
      category: "dresses",
      gender: "women",
      sizes: "XS,S,M,L",
      color: "Blush Floral",
      image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80",
      stock: 18,
      is_featured: 1,
      is_new: 1
    },
    {
      id: 3,
      name: "Heavyweight Boxy Crewneck T-Shirt",
      description: "Made from 240 GSM organic ring-spun cotton. Features a relaxed drop-shoulder cut and durable ribbed collar.",
      price: 28.00,
      original_price: 35.00,
      category: "t-shirts",
      gender: "men",
      sizes: "S,M,L,XL,XXL",
      color: "Charcoal Black",
      image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
      stock: 45,
      is_featured: 1,
      is_new: 0
    },
    {
      id: 4,
      name: "Ribbed Knit Sleeveless Top",
      description: "Soft viscose blend ribbed tank top with a high neckline. Perfect layering essential for all seasons.",
      price: 24.99,
      original_price: 32.00,
      category: "tops",
      gender: "women",
      sizes: "XS,S,M,L",
      color: "Cream Ivory",
      image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80",
      stock: 30,
      is_featured: 0,
      is_new: 1
    },
    {
      id: 5,
      name: "Slim-Fit Selvedge Denim Jeans",
      description: "Crafted from 13.5oz Japanese stretch selvedge denim. Clean wash with custom copper hardware and 5-pocket design.",
      price: 79.99,
      original_price: 99.99,
      category: "jeans",
      gender: "men",
      sizes: "30,32,34,36",
      color: "Deep Indigo",
      image_url: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80",
      stock: 22,
      is_featured: 1,
      is_new: 0
    },
    {
      id: 6,
      name: "High-Rise Straight Leg Denim",
      description: "Vintage inspired 90s silhouette cut from structured denim with a flattering high waist and ankle grazing hem.",
      price: 69.00,
      original_price: 89.00,
      category: "jeans",
      gender: "women",
      sizes: "26,28,30,32",
      color: "Vintage Light Blue",
      image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80",
      stock: 15,
      is_featured: 1,
      is_new: 1
    },
    {
      id: 7,
      name: "Vintage Biker Leather Jacket",
      description: "Premium full-grain synthetic leather jacket featuring silver hardware, asymmetric zipper, and satin lining.",
      price: 119.00,
      original_price: 150.00,
      category: "jackets",
      gender: "women",
      sizes: "S,M,L",
      color: "Midnight Black",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
      stock: 12,
      is_featured: 1,
      is_new: 1
    },
    {
      id: 8,
      name: "Urban Utility Bomber Jacket",
      description: "Water-resistant nylon outer shell with thermal quilting, sleeve utility pocket, and ribbed athletic trims.",
      price: 95.00,
      original_price: 125.00,
      category: "jackets",
      gender: "men",
      sizes: "M,L,XL",
      color: "Olive Green",
      image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80",
      stock: 16,
      is_featured: 0,
      is_new: 1
    }
  ],
  contactMessages: [],
  adminUsers: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@stylehub.store',
      // Hash for 'admin123'
      password_hash: '$2a$10$wT2B1tJ.o7yvHk.YqO8KueRk5C9m0N0cWjVbA8U7kS5Z7wG3tMh7W'
    }
  ]
};

/**
 * Initialize connection pool and attempt database test
 */
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${dbConfig.database}`);
    connection.release();
    isConnected = true;
  } catch (err) {
    console.warn(`[Database Notice] MySQL server is not currently reachable (${err.message}).`);
    console.warn(`[Database Notice] Operating in resilient memory mode so your application runs without interruption.`);
    console.warn(`[Database Notice] To connect to MySQL later: Start MySQL (via XAMPP or service) and import backend/database/schema.sql.`);
    isConnected = false;
  }
}

// Initialize on module load
initDatabase();

/**
 * Execute parameterized query with automatic fallback
 */
async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('[Database Error]', err.message);
      throw err;
    }
  }

  // --- Fallback memory execution ---
  const upper = sql.trim().toUpperCase();

  // SELECT products
  if (upper.startsWith('SELECT') && upper.includes('FROM PRODUCTS')) {
    let results = [...inMemoryStore.products];

    // Check by ID
    if (upper.includes('WHERE ID = ?') && params.length > 0) {
      const found = results.find(p => p.id === parseInt(params[0], 10));
      return found ? [found] : [];
    }

    return results;
  }

  // INSERT INTO products
  if (upper.startsWith('INSERT INTO PRODUCTS')) {
    const newId = inMemoryStore.products.length > 0 
      ? Math.max(...inMemoryStore.products.map(p => p.id)) + 1 
      : 1;

    const newProduct = {
      id: newId,
      name: params[0],
      description: params[1],
      price: params[2],
      original_price: null,
      category: params[3],
      gender: params[4],
      sizes: params[5],
      color: params[6],
      image_url: params[7],
      stock: params[8] || 0,
      is_featured: 0,
      is_new: 1
    };

    inMemoryStore.products.unshift(newProduct);
    return { insertId: newId, affectedRows: 1 };
  }

  // UPDATE products
  if (upper.startsWith('UPDATE PRODUCTS')) {
    const id = parseInt(params[params.length - 1], 10);
    const index = inMemoryStore.products.findIndex(p => p.id === id);
    if (index > -1) {
      inMemoryStore.products[index] = {
        ...inMemoryStore.products[index],
        name: params[0],
        description: params[1],
        price: params[2],
        category: params[3],
        gender: params[4],
        sizes: params[5],
        color: params[6],
        image_url: params[7],
        stock: params[8]
      };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DELETE FROM products
  if (upper.startsWith('DELETE FROM PRODUCTS')) {
    const id = parseInt(params[0], 10);
    const initialLen = inMemoryStore.products.length;
    inMemoryStore.products = inMemoryStore.products.filter(p => p.id !== id);
    return { affectedRows: initialLen - inMemoryStore.products.length };
  }

  // SELECT admin_users
  if (upper.startsWith('SELECT') && upper.includes('FROM ADMIN_USERS')) {
    if (upper.includes('EMAIL = ?')) {
      const email = params[0];
      const user = inMemoryStore.adminUsers.find(u => u.email === email || u.username === email);
      return user ? [user] : [];
    }
    if (upper.includes('ID = ?')) {
      const id = parseInt(params[0], 10);
      const user = inMemoryStore.adminUsers.find(u => u.id === id);
      return user ? [user] : [];
    }
    return inMemoryStore.adminUsers;
  }

  // INSERT INTO contact_messages
  if (upper.startsWith('INSERT INTO CONTACT_MESSAGES')) {
    inMemoryStore.contactMessages.push({
      id: inMemoryStore.contactMessages.length + 1,
      name: params[0],
      email: params[1],
      message: params[2],
      created_at: new Date()
    });
    return { insertId: inMemoryStore.contactMessages.length, affectedRows: 1 };
  }

  return [];
}

module.exports = {
  query,
  isDatabaseConnected: () => isConnected,
  getPool: () => pool
};
