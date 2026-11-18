import api from './api';

export const authService = {
  async login(email, password) {
    try {
      console.log('authService.login called with:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { user, token } = response.data.data;
      
      if (!user || !token) {
        throw new Error('Invalid response from server: missing user or token');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('User and token stored successfully');
      return { user, token };
    } catch (error) {
      console.error('authService.login error:', error);
      throw error;
    }
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
