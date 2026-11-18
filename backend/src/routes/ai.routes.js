import express from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.post('/tickets/:id/investigate', authorize('agent', 'admin'), aiController.investigateTicket);

export default router;
