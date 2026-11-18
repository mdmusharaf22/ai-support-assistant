import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  try {
    console.log('Running seed data...');
    
    // First, seed users with properly hashed passwords
    console.log('1. Seeding users...');
    await execAsync('node seeds/seed-users.js');
    
    // Then, seed the rest of the data - run all SQL files in order
    console.log('2. Seeding orders, payments, and tickets...');
    const sqlFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of sqlFiles) {
      console.log(`   Running ${file}...`);
      const seedFile = path.join(__dirname, file);
      const sql = fs.readFileSync(seedFile, 'utf8');
      await pool.query(sql);
    }
    
    console.log('✓ All seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

runSeeds();
