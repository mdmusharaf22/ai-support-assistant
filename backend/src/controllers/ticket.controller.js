import { ticketRepository } from '../repositories/ticket.repository.js';

export const ticketController = {
  async getAll(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        issueType: req.query.issueType,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined
      };
      
      // Customers see only their tickets
      if (req.user.role === 'customer') {
        filters.customerId = req.user.id;
      }
      
      // Agents see only their assigned tickets by default
      // Admin sees all tickets
      if (req.user.role === 'agent') {
        filters.agentId = req.user.id;
      }
      
      const tickets = await ticketRepository.findAll(filters);
      
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const ticket = await ticketRepository.findById(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      // Authorization check
      if (req.user.role === 'customer' && ticket.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      console.log('Create ticket request body:', req.body);
      console.log('Authenticated user:', req.user);
      
      // Handle both camelCase and snake_case
      const issueType = req.body.issueType || req.body.issue_type;
      
      // Determine customer ID
      let customerId;
      if (req.user.role === 'customer') {
        // Customers create tickets for themselves
        customerId = req.user.id;
      } else if (req.body.customerId) {
        // Agents/admins can create tickets for specific customers
        customerId = req.body.customerId;
      } else {
        // If no customerId provided, use the current user's ID
        // (This allows agents to test ticket creation)
        customerId = req.user.id;
      }
      
      const ticketData = {
        customerId: customerId,
        assignedAgentId: req.body.assignedAgentId,
        subject: req.body.subject,
        description: req.body.description,
        issueType: issueType,
        orderNumber: req.body.order_number || req.body.orderNumber || null
      };
      
      console.log('Ticket data to create:', ticketData);
      
      // Validate required fields
      if (!ticketData.customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }
      
      if (!ticketData.subject || !ticketData.description) {
        return res.status(400).json({
          success: false,
          error: 'Subject and description are required'
        });
      }
      
      const ticket = await ticketRepository.create(ticketData);
      
      console.log('Ticket created:', ticket);
      
      res.status(201).json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const ticket = await ticketRepository.updateStatus(req.params.id, status);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const ticketId = req.params.id;
      
      // Get the ticket first to check ownership
      const ticket = await ticketRepository.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      // Business logic: Only customers can edit their own tickets
      // AND only if no agent has been assigned yet (status is still 'open')
      if (req.user.role === 'customer') {
        if (ticket.customer_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'You can only edit your own tickets'
          });
        }
        
        if (ticket.status !== 'open' || ticket.assigned_agent_id) {
          return res.status(403).json({
            success: false,
            error: 'Cannot edit ticket after an agent has been assigned'
          });
        }
      }
      
      // Agents can update any ticket
      const updateData = {
        subject: req.body.subject || ticket.subject,
        description: req.body.description || ticket.description,
        issueType: req.body.issue_type || req.body.issueType || ticket.issue_type,
        orderNumber: req.body.order_number || req.body.orderNumber || ticket.order_number
      };
      
      const updatedTicket = await ticketRepository.update(ticketId, updateData);
      
      res.json({
        success: true,
        data: updatedTicket
      });
    } catch (error) {
      next(error);
    }
  },

  async assignAgent(req, res, next) {
    try {
      const { agentId } = req.body;
      const ticket = await ticketRepository.assignAgent(req.params.id, agentId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const ticketId = req.params.id;
      
      // Get the ticket first to check ownership
      const ticket = await ticketRepository.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      // Business logic: Customers can only delete their own tickets
      // AND only if no agent has been assigned yet
      if (req.user.role === 'customer') {
        if (ticket.customer_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'You can only delete your own tickets'
          });
        }
        
        if (ticket.status !== 'open' || ticket.assigned_agent_id) {
          return res.status(403).json({
            success: false,
            error: 'Cannot delete ticket after an agent has been assigned'
          });
        }
      }
      
      // Agents can delete any ticket
      await ticketRepository.delete(ticketId);
      
      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
