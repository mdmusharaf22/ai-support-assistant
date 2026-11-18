import api from './api';

export const orderService = {
  async getMyOrders() {
    const response = await api.get('/orders/my-orders');
    return response.data.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  }
};
