import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.message || data?.error || error.message;

    if (status === 401) {
      error.displayMessage = message;
      if (typeof window !== 'undefined') {
        if (message.includes('expired') || message.includes('failed')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    if (status === 403) {
      error.displayMessage = message || 'Access denied. You do not have permission to perform this action.';
    }

    if (status === 404) {
      error.displayMessage = 'The requested resource was not found.';
    }

    if (status === 500) {
      error.displayMessage = 'Server error. Please try again or contact support.';
    }

    return Promise.reject(error);
  }
);

export default api;