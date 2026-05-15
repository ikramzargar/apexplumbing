import api from './axios';

export const getCurrentStock = async (queryString = '') => {
  const response = await api.get(`/stock${queryString}`);
  return response.data;
};

export const stockIn = async (data) => {
  const response = await api.post('/stock/in', data);
  return response.data;
};

export const manualStockOut = async (data) => {
  const response = await api.post('/stock/manual-out', data);
  return response.data;
};

export const getMovements = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/stock/movements${params ? `?${params}` : ''}`);
  return response.data;
};

export const getLowStock = async () => {
  const response = await api.get('/stock/low');
  return response.data;
};