import { ticketRepository } from '../repositories/ticket.repository.js';

export const dashboardController = {
  async getSummary(req, res, next) {
    try {
      const filters = {};
      
      // Customers see only their own tickets
      if (req.user.role === 'customer') {
        filters.customerId = req.user.id;
      }
      
      // Agents see only their assigned tickets
      if (req.user.role === 'agent') {
        filters.agentId = req.user.id;
      }
      
      // Admin sees all tickets (no filter)
      
      const stats = await ticketRepository.getStats(filters);
      
      // Get recent tickets
      const recentTickets = await ticketRepository.findAll({
        ...filters,
        limit: 5
      });
      
      res.json({
        success: true,
        data: {
          stats: {
            total: parseInt(stats.total) || 0,
            open: parseInt(stats.open) || 0,
            inProgress: parseInt(stats.in_progress) || 0,
            resolved: parseInt(stats.resolved) || 0,
            closed: parseInt(stats.closed) || 0,
            orderIssues: parseInt(stats.order_issues) || 0,
            paymentIssues: parseInt(stats.payment_issues) || 0
          },
          recentTickets
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
