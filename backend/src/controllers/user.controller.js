import { query } from '../config/database.js';

export const userController = {
  async getAgents(req, res, next) {
    try {
      const sql = `
        SELECT id, name, email, role
        FROM users
        WHERE role = 'agent'
        ORDER BY name
      `;
      
      const result = await query(sql);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  }
};
