import { orderRepository } from '../repositories/order.repository.js';

export async function lookupOrder({ orderNumber, customerId }) {
  // Verify customer owns this order
  const hasAccess = await orderRepository.verifyOwnership(orderNumber, customerId);
  
  if (!hasAccess) {
    return {
      success: false,
      error: 'Order not found or access denied',
      orderNumber
    };
  }
  
  // Retrieve order details
  const order = await orderRepository.findByOrderNumber(orderNumber);
  
  if (!order) {
    return {
      success: false,
      error: 'Order not found',
      orderNumber
    };
  }
  
  return {
    success: true,
    orderNumber: order.order_number,
    status: order.status,
    orderedAt: order.ordered_at,
    expectedDelivery: order.expected_delivery_at,
    trackingStatus: order.tracking_status
  };
}
