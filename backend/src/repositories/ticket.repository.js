import { query } from '../config/database.js';

export const ticketRepository = {
  async findAll(filters = {}) {
    let sql = `
      SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        a.name as agent_name
      FROM tickets t
      LEFT JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.customerId) {
      params.push(filters.customerId);
      sql += ` AND t.customer_id = $${params.length}`;
    }
    
    if (filters.agentId) {
      params.push(filters.agentId);
      sql += ` AND t.assigned_agent_id = $${params.length}`;
    }
    
    if (filters.status) {
      params.push(filters.status);
      sql += ` AND t.status = $${params.length}`;
    }
    
    if (filters.issueType) {
      params.push(filters.issueType);
      sql += ` AND t.issue_type = $${params.length}`;
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    if (filters.limit) {
      params.push(filters.limit);
      sql += ` LIMIT $${params.length}`;
    }
    
    const result = await query(sql, params);
    return result.rows;
  },

  async findById(id) {
    const sql = `
      SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        a.name as agent_name
      FROM tickets t
      LEFT JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      WHERE t.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  async create(ticketData) {
    const sql = `
      INSERT INTO tickets (
        customer_id,
        assigned_agent_id,
        subject,
        description,
        issue_type,
        order_number,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const params = [
      ticketData.customerId,
      ticketData.assignedAgentId || null,
      ticketData.subject,
      ticketData.description,
      ticketData.issueType,
      ticketData.orderNumber || null,
      ticketData.status || 'open'
    ];
    
    const result = await query(sql, params);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const sql = `
      UPDATE tickets
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [status, id]);
    return result.rows[0];
  },

  async assignAgent(ticketId, agentId) {
    const sql = `
      UPDATE tickets
      SET assigned_agent_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [agentId, ticketId]);
    return result.rows[0];
  },

  async update(id, ticketData) {
    const sql = `
      UPDATE tickets
      SET 
        subject = $1,
        description = $2,
        issue_type = $3,
        order_number = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const params = [
      ticketData.subject,
      ticketData.description,
      ticketData.issueType,
      ticketData.orderNumber || null,
      id
    ];
    
    const result = await query(sql, params);
    return result.rows[0];
  },

  async delete(id) {
    const sql = 'DELETE FROM tickets WHERE id = $1';
    await query(sql, [id]);
    return true;
  },

  async getStats(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed,
        COUNT(*) FILTER (WHERE issue_type = 'order_issue') as order_issues,
        COUNT(*) FILTER (WHERE issue_type = 'payment_issue') as payment_issues
      FROM tickets
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.customerId) {
      params.push(filters.customerId);
      sql += ` AND customer_id = $${params.length}`;
    }
    
    if (filters.agentId) {
      params.push(filters.agentId);
      sql += ` AND assigned_agent_id = $${params.length}`;
    }
    
    const result = await query(sql, params);
    return result.rows[0];
  }
};
