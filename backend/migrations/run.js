import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Get all SQL files in migrations directory
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run in alphabetical order (001, 002, etc.)
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const migrationFile = path.join(__dirname, file);
      const sql = fs.readFileSync(migrationFile, 'utf8');
      await pool.query(sql);
      console.log(`✓ ${file} completed`);
    }
    
    console.log('✓ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
