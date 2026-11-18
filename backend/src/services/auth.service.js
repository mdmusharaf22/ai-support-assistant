import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { config } from '../config/env.js';

export const authService = {
  async register(userData) {
    const { name, email, password, role = 'customer' } = userData;
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role]
    );
    
    const user = result.rows[0];
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );
    
    return { user, token };
  },

  async login(email, password) {
    console.log('Login attempt for:', email);
    
    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      console.log('User not found:', email);
      throw new Error('Invalid credentials');
    }
    
    console.log('User found, verifying password...');
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('Invalid password for:', email);
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );
    
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('Login successful, returning user and token');
    return { user: userWithoutPassword, token };
  },

  async getUserById(id) {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  },

  async updateProfile(userId, data) {
    const { name } = data;
    
    const result = await query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, created_at',
      [name, userId]
    );
    
    return result.rows[0];
  },

  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password hash
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );
    
    return true;
  }
};
