import { query } from '../config/database.js';

export const customerController = {
  async getAll(req, res, next) {
    try {
      // Get all customers with their ticket counts
      const result = await query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.created_at,
          COUNT(t.id) as total_tickets,
          COUNT(t.id) FILTER (WHERE t.status = 'open') as open_tickets,
          COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tickets,
          COUNT(t.id) FILTER (WHERE t.status = 'resolved') as resolved_tickets,
          MAX(t.created_at) as last_ticket_date
        FROM users u
        LEFT JOIN tickets t ON u.id = t.customer_id
        WHERE u.role = 'customer'
        GROUP BY u.id, u.name, u.email, u.created_at
        ORDER BY u.created_at DESC
      `);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const customerId = req.params.id;
      
      // Get customer details
      const customerResult = await query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1 AND role = $2',
        [customerId, 'customer']
      );
      
      if (customerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }
      
      const customer = customerResult.rows[0];
      
      // Get customer's tickets
      const ticketsResult = await query(
        `SELECT 
          id, subject, description, status, issue_type, created_at, updated_at
        FROM tickets
        WHERE customer_id = $1
        ORDER BY created_at DESC`,
        [customerId]
      );
      
      res.json({
        success: true,
        data: {
          ...customer,
          tickets: ticketsResult.rows
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
