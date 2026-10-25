/* ==========================================================================
   StyleHub - Authentication Routes
   ========================================================================== */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAdminAuth = require('../middleware/auth');

// Public Login Endpoint
router.post('/login', authController.login);

// Protected User Information Endpoint
router.get('/me', requireAdminAuth, authController.getMe);

// Logout Endpoint
router.post('/logout', authController.logout);

module.exports = router;
