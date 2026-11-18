import { aiService } from '../services/ai.service.js';
import { ticketRepository } from '../repositories/ticket.repository.js';

export const aiController = {
  async investigateTicket(req, res, next) {
    try {
      const ticketId = req.params.id;
      
      // Get ticket to find customer
      const ticket = await ticketRepository.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      // Authorization: agents and admins can investigate any ticket
      if (req.user.role === 'customer' && ticket.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      // Run AI investigation using the ticket's customer ID
      const result = await aiService.investigateTicket(ticketId, ticket.customer_id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};
