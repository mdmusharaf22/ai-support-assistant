import { query } from '../config/database.js';

export const orderRepository = {
  async findByOrderNumber(orderNumber) {
    const sql = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.order_number = $1
    `;
    
    const result = await query(sql, [orderNumber]);
    return result.rows[0];
  },

  async findById(id) {
    const sql = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  async findByCustomerId(customerId) {
    const sql = `
      SELECT *
      FROM orders
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await query(sql, [customerId]);
    return result.rows;
  },

  async create(orderData) {
    const sql = `
      INSERT INTO orders (
        customer_id,
        order_number,
        status,
        ordered_at,
        expected_delivery_at,
        tracking_status
      )
      VALUES ($1, $2, $3, NOW(), $4, $5)
      RETURNING *
    `;
    
    const params = [
      orderData.customerId,
      orderData.orderNumber,
      orderData.status,
      orderData.expectedDeliveryAt,
      orderData.trackingStatus
    ];
    
    const result = await query(sql, params);
    return result.rows[0];
  },

  async verifyOwnership(orderNumber, customerId) {
    const sql = `
      SELECT id
      FROM orders
      WHERE order_number = $1 AND customer_id = $2
    `;
    
    const result = await query(sql, [orderNumber, customerId]);
    return result.rows.length > 0;
  }
};
