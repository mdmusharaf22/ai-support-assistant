import express from 'express';
import { customerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('agent', 'admin')); // Only agents and admins can access

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);

export default router;
