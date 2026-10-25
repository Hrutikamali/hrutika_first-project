/* ==========================================================================
   StyleHub - Create / Reset Admin Account Script
   Safely generates bcrypt password hash and inserts/updates admin_users table
   Usage: node scripts/create-admin.js <username> <email> <password>
   ========================================================================== */

const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function createAdmin() {
  const args = process.argv.slice(2);
  const username = args[0] || 'admin';
  const email = args[1] || 'admin@stylehub.store';
  const password = args[2] || 'admin123';

  console.log(`[Admin Init] Preparing account for: ${email}`);

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO admin_users (username, email, password_hash)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `;

    await db.query(sql, [username, email, passwordHash]);
    console.log('✅ Admin user provisioned successfully!');
    console.log(`   Username: ${username}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin user:', err.message);
    process.exit(1);
  }
}

createAdmin();
