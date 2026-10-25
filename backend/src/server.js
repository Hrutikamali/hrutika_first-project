/* ==========================================================================
   StyleHub - HTTP Server Entrypoint
   ========================================================================== */

const app = require('./app');
require('dotenv').config();

const PORT = parseInt(process.env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log('\n============================================================');
  console.log('   👗 STYLEHUB - ONLINE CLOTHING STORE (FULL-STACK)');
  console.log('============================================================');
  console.log(` ✅ Server is running and listening on port ${PORT}`);
  console.log(` 🌐 Storefront URL:       http://localhost:${PORT}`);
  console.log(` 🛍️  Shop Catalog:         http://localhost:${PORT}/shop.html`);
  console.log(` 🛒 Shopping Cart:        http://localhost:${PORT}/cart.html`);
  console.log(` 🔐 Admin Login Portal:   http://localhost:${PORT}/admin/login.html`);
  console.log(` ⚡ API Health Status:    http://localhost:${PORT}/api/health`);
  console.log('------------------------------------------------------------');
  console.log(' Default Admin Credentials:');
  console.log(' Email:    admin@stylehub.store');
  console.log(' Password: admin123');
  console.log('============================================================\n');
});
