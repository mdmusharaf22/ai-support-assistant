import { query } from '../config/database.js';

export const paymentRepository = {
  async findByOrderNumber(orderNumber) {
    const sql = `
      SELECT p.*
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE o.order_number = $1
      ORDER BY p.created_at ASC
    `;
    
    const result = await query(sql, [orderNumber]);
    return result.rows;
  },

  async findByCustomerId(customerId) {
    const sql = `
      SELECT p.*, o.order_number
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.customer_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const result = await query(sql, [customerId]);
    return result.rows;
  },

  async verifyOwnership(orderNumber, customerId) {
    const sql = `
      SELECT p.id
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE o.order_number = $1 AND p.customer_id = $2
      LIMIT 1
    `;
    
    const result = await query(sql, [orderNumber, customerId]);
    return result.rows.length > 0;
  }
};
