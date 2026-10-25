/* ==========================================================================
   StyleHub - Product Controller
   Implements CRUD operations with parameterized queries and combined filtering
   ========================================================================== */

const db = require('../config/db');

/**
 * Format database product rows for frontend consumption
 */
function formatProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    original_price: row.original_price ? parseFloat(row.original_price) : null,
    category: row.category,
    gender: row.gender,
    sizes: typeof row.sizes === 'string' ? row.sizes.split(',').map(s => s.trim()) : (row.sizes || ['M']),
    color: row.color,
    image_url: row.image_url,
    stock: parseInt(row.stock, 10),
    is_featured: Boolean(row.is_featured),
    is_new: Boolean(row.is_new),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * GET /api/products
 * Retrieves products with optional filters: ?gender=men&category=shirts&search=cotton
 */
async function getAllProducts(req, res, next) {
  try {
    const { gender, category, search } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (gender && gender !== 'all') {
      sql += ' AND LOWER(gender) = LOWER(?)';
      params.push(gender.trim());
    }

    if (category && category !== 'all') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category.trim());
    }

    if (search && search.trim()) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id DESC';

    const rows = await db.query(sql, params);
    const products = rows.map(formatProduct);

    res.json(products);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Fetches a single product by numeric ID
 */
async function getProductById(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID. Must be a positive integer.' });
    }

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: `Product with ID ${productId} not found.` });
    }

    res.json(formatProduct(rows[0]));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Creates a new clothing product (Admin Only)
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, gender, sizes, color, image_url, stock } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Product name is required (min 2 characters).' });
    }
    if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Valid positive price is required.' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required.' });
    }
    if (!gender || !['men', 'women', 'unisex'].includes(gender.toLowerCase())) {
      return res.status(400).json({ error: 'Gender must be either "men", "women", or "unisex".' });
    }
    if (!image_url || typeof image_url !== 'string') {
      return res.status(400).json({ error: 'Valid image URL is required.' });
    }

    const formattedSizes = Array.isArray(sizes) ? sizes.join(',') : (sizes || 'S,M,L');
    const numericStock = parseInt(stock, 10) >= 0 ? parseInt(stock, 10) : 10;

    const sql = `
      INSERT INTO products (name, description, price, category, gender, sizes, color, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      name.trim(),
      (description || '').trim(),
      parseFloat(price),
      category.trim().toLowerCase(),
      gender.trim().toLowerCase(),
      formattedSizes,
      (color || '').trim(),
      image_url.trim(),
      numericStock
    ];

    const result = await db.query(sql, params);
    const newId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      id: newId,
      product: {
        id: newId,
        name: name.trim(),
        description: (description || '').trim(),
        price: parseFloat(price),
        category: category.trim().toLowerCase(),
        gender: gender.trim().toLowerCase(),
        sizes: formattedSizes.split(','),
        color: (color || '').trim(),
        image_url: image_url.trim(),
        stock: numericStock
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id
 * Updates an existing product (Admin Only)
 */
async function updateProduct(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    // Check if product exists
    const existing = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: `Product with ID ${productId} not found.` });
    }

    const { name, description, price, category, gender, sizes, color, image_url, stock } = req.body;

    const formattedSizes = Array.isArray(sizes) ? sizes.join(',') : (sizes || existing[0].sizes);
    const numericPrice = price !== undefined ? parseFloat(price) : parseFloat(existing[0].price);
    const numericStock = stock !== undefined ? parseInt(stock, 10) : parseInt(existing[0].stock, 10);

    const sql = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, category = ?, gender = ?, sizes = ?, color = ?, image_url = ?, stock = ?
      WHERE id = ?
    `;
    const params = [
      (name || existing[0].name).trim(),
      (description !== undefined ? description : existing[0].description).trim(),
      numericPrice,
      (category || existing[0].category).trim().toLowerCase(),
      (gender || existing[0].gender).trim().toLowerCase(),
      formattedSizes,
      (color !== undefined ? color : existing[0].color || '').trim(),
      (image_url || existing[0].image_url).trim(),
      numericStock,
      productId
    ];

    await db.query(sql, params);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: productId,
        name: params[0],
        description: params[1],
        price: params[2],
        category: params[3],
        gender: params[4],
        sizes: formattedSizes.split(','),
        color: params[6],
        image_url: params[7],
        stock: params[8]
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 * Removes a product (Admin Only)
 */
async function deleteProduct(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const existing = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: `Product with ID ${productId} not found.` });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: `Product ${productId} deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
