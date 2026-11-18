import bcrypt from 'bcrypt';
import pool from './src/config/database.js';

async function verifyAdmin() {
  try {
    const result = await pool.query(
      'SELECT email, password_hash FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }
    
    const admin = result.rows[0];
    console.log('✓ Admin user found:', admin.email);
    
    const isValid = await bcrypt.compare('password123', admin.password_hash);
    console.log('✓ Password "password123" valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Password does not match! Re-hashing...');
      const newHash = await bcrypt.hash('password123', 10);
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [newHash, 'admin@example.com']
      );
      console.log('✓ Password updated successfully!');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAdmin();
