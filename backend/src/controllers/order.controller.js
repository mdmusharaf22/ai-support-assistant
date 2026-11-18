import { orderRepository } from '../repositories/order.repository.js';
import { query } from '../config/database.js';

export const orderController = {
  // Get all orders for the logged-in customer
  async getMyOrders(req, res, next) {
    try {
      const customerId = req.user.id;
      const orders = await orderRepository.findByCustomerId(customerId);
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single order details
  async getOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      const order = await orderRepository.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      // Check ownership for customers
      if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new order
  async createOrder(req, res, next) {
    try {
      const { items, totalAmount } = req.body;
      const customerId = req.user.id;
      
      if (!items || items.length === 0 || !totalAmount) {
        return res.status(400).json({
          success: false,
          error: 'Items and total amount are required'
        });
      }
      
      // Generate order number
      const orderNumber = await generateOrderNumber();
      
      // Calculate expected delivery (7 days from now)
      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + 7);
      
      const orderData = {
        customerId,
        orderNumber,
        status: 'placed',
        expectedDeliveryAt: expectedDelivery,
        trackingStatus: 'order_placed',
        items: JSON.stringify(items),
        totalAmount
      };
      
      const order = await orderRepository.create(orderData);
      
      if (!order || !order.id) {
        throw new Error('Order creation failed - no order ID returned');
      }
      
      console.log('Order created:', order.id, orderNumber);
      
      // Auto-create payment for the order
      const paymentData = {
        orderId: order.id,
        customerId,
        transactionReference: `TXN-${orderNumber.split('-')[1]}`,
        amount: totalAmount,
        currency: 'INR',
        status: 'success'
      };
      
      const paymentResult = await query(`
        INSERT INTO payments (order_id, customer_id, transaction_reference, amount, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, transaction_reference
      `, [
        paymentData.orderId,
        paymentData.customerId,
        paymentData.transactionReference,
        paymentData.amount,
        paymentData.currency,
        paymentData.status
      ]);
      
      console.log('Payment created:', paymentResult.rows[0]);
      
      res.status(201).json({
        success: true,
        data: {
          ...order,
          payment: paymentResult.rows[0]
        }
      });
    } catch (error) {
      console.error('Order creation error:', error);
      next(error);
    }
  }
};

// Helper function to generate unique order number
async function generateOrderNumber() {
  const result = await query(
    'SELECT order_number FROM orders ORDER BY id DESC LIMIT 1'
  );
  
  if (result.rows.length === 0) {
    return 'ORD-1001';
  }
  
  const lastOrder = result.rows[0].order_number;
  const lastNumber = parseInt(lastOrder.split('-')[1]);
  const nextNumber = lastNumber + 1;
  
  return `ORD-${nextNumber.toString().padStart(4, '0')}`;
}
