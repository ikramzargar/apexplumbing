import api from './axios';

export const getSalesReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/reports/sales${params ? `?${params}` : ''}`);
  return response.data;
};

export const getStockReport = async () => {
  const response = await api.get('/reports/stock');
  return response.data;
};

export const getPlumberReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/reports/plumbers${params ? `?${params}` : ''}`);
  return response.data;
};

export const getOutstandingReport = async () => {
  const response = await api.get('/reports/outstanding');
  return response.data;
};

export const getDistrictReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/reports/district${params ? `?${params}` : ''}`);
  return response.data;
};

export const getStaffReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/reports/staff${params ? `?${params}` : ''}`);
  return response.data;
};

export const getUserReport = async (userId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/reports/staff/${userId}${params ? `?${params}` : ''}`);
  return response.data;
};