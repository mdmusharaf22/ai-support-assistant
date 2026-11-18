import bcrypt from 'bcrypt';

// Generate password hashes for seed data
// Run with: node seeds/generate-hashes.js

const password = 'password123';
const saltRounds = 10;

async function generateHash() {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated hash for password "password123":');
  console.log(hash);
  console.log('\nCopy this hash to your 001_seed_data.sql file');
}

generateHash();
