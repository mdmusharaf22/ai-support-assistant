import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

// Get my orders (customer only)
router.get('/my-orders', orderController.getMyOrders);

// Get single order
router.get('/:id', orderController.getOrderById);

// Create order (customer only)
router.post('/', orderController.createOrder);

export default router;
