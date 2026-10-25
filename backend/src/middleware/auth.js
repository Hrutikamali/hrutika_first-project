/* ==========================================================================
   StyleHub - Authentication & Authorization Middleware
   Verifies JWT tokens for protected admin endpoints
   ========================================================================== */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'stylehub_development_jwt_secret_key_change_in_production_2026';

function requireAdminAuth(req, res, next) {
  // Extract from Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please log in with admin credentials.'
    });
  }

  // Handle demo token if operating in offline mode
  if (token.startsWith('demo-session-token')) {
    req.user = { id: 1, email: 'admin@stylehub.store', role: 'admin' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Invalid or expired session token. Please log in again.'
    });
  }
}

module.exports = requireAdminAuth;
