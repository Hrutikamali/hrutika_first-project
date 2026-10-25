/* ==========================================================================
   StyleHub - Express Application Setup
   Integrates CORS, JSON parsing, static storefront serving, and REST APIs
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { isDatabaseConnected } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight Request Logger
app.use((req, res, next) => {
  if (!req.url.startsWith('/css') && !req.url.startsWith('/js') && !req.url.startsWith('/assets')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// REST API Endpoints
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Server Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: isDatabaseConnected() ? 'connected (MySQL)' : 'active (in-memory mode)',
    version: '1.0.0'
  });
});

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for root or client navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
