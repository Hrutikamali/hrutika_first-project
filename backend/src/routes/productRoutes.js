/* ==========================================================================
   StyleHub - Product Routes
   ========================================================================== */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const requireAdminAuth = require('../middleware/auth');

// Public Product Endpoints
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Admin Endpoints
router.post('/', requireAdminAuth, productController.createProduct);
router.put('/:id', requireAdminAuth, productController.updateProduct);
router.delete('/:id', requireAdminAuth, productController.deleteProduct);

module.exports = router;
