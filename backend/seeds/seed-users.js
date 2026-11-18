import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';

async function seedUsers() {
  try {
    console.log('Seeding users with hashed passwords...');
    
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    // Insert users with properly hashed passwords
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES
        ('Customer One', 'customer1@example.com', $1, 'customer'),
        ('Customer Two', 'customer2@example.com', $1, 'customer'),
        ('Support Agent', 'agent@example.com', $1, 'agent'),
        ('Admin User', 'admin@example.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hash]);
    
    console.log('✓ Users seeded successfully');
    console.log('  Password for all users: password123');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
