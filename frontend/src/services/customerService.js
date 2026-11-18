import api from './api';

export const customerService = {
  async getAll() {
    const response = await api.get('/customers');
    return response.data.data;
  },

  async getById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  }
};
