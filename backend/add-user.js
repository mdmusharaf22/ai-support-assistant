import bcrypt from 'bcrypt';
import pool from './src/config/database.js';

async function addUser() {
  try {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, ['Mohamed Musharaf', 'mohamedmusharaf467@gmail.com', hash, 'agent']);
    
    console.log('✓ User added/updated successfully');
    console.log('  Email: mohamedmusharaf467@gmail.com');
    console.log('  Password: password123');
    console.log('  Role: agent');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUser();
