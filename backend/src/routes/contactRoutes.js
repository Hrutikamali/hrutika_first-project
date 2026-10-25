/* ==========================================================================
   StyleHub - Contact Routes
   ========================================================================== */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Submit Contact Form
router.post('/', contactController.submitContact);

module.exports = router;
