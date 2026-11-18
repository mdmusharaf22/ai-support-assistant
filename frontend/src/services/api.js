import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Show toast for unauthorized errors
      toast.error('Session expired or unauthorized. Please login again.');
      
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't auto-redirect - let user see the error message
      // User can manually navigate to login if needed
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      // Not found
      toast.error(error.response?.data?.error || 'Resource not found.');
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      // Network error
      toast.error('Network error. Please check your connection and ensure the backend server is running.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
