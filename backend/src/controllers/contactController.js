/* ==========================================================================
   StyleHub - Contact Form Controller
   Validates contact inquiries and stores them safely in MySQL
   ========================================================================== */

const db = require('../config/db');

/**
 * POST /api/contact
 * Validates and records contact message
 */
async function submitContact(req, res, next) {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (minimum 2 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a message (minimum 10 characters).' });
    }

    const sql = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
    const params = [name.trim(), email.trim(), message.trim()];

    await db.query(sql, params);

    res.status(201).json({
      success: true,
      message: `Thank you, ${name.trim()}! Your inquiry has been received. Our team will review your message.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitContact
};
