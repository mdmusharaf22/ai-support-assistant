import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

// Get all agents - for ticket assignment
router.get('/agents', authorize('agent', 'admin'), userController.getAgents);

export default router;
