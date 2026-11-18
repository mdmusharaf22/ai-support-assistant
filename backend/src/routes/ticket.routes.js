import express from 'express';
import { ticketController } from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

// Get all tickets (filtered by role)
router.get('/', ticketController.getAll);

// Get single ticket
router.get('/:id', ticketController.getById);

// Create ticket (customers create for themselves, agents can create for customers)
router.post('/', ticketController.create);

// Update ticket content (subject/description) - customers can edit their own tickets
router.put('/:id', ticketController.update);

// Update ticket status - agents only
router.patch('/:id/status', authorize('agent', 'admin'), ticketController.updateStatus);

// Assign agent to ticket - agents only
router.patch('/:id/assign', authorize('agent', 'admin'), ticketController.assignAgent);

// Delete ticket (customers can delete their own, agents can delete any)
router.delete('/:id', ticketController.delete);

export default router;
