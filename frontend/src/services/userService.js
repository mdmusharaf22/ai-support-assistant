import api from './api';

export const userService = {
  async getAgents() {
    const response = await api.get('/users/agents');
    return response.data.data;
  }
};
