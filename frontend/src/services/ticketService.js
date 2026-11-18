import api from './api';

export const ticketService = {
  async getAll(params = {}) {
    const response = await api.get('/tickets', { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data;
  },

  async create(ticketData) {
    const response = await api.post('/tickets', ticketData);
    return response.data.data;
  },

  async update(id, ticketData) {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/tickets/${id}/status`, { status });
    return response.data.data;
  },

  async assignAgent(id, agentId) {
    const response = await api.patch(`/tickets/${id}/assign`, { agentId });
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },

  async investigateWithAI(ticketId) {
    const response = await api.post(`/ai/tickets/${ticketId}/investigate`);
    return response.data.data;
  }
};
