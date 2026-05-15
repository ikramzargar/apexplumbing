import api from './axios.js';

export const createStockRequest = async (items, note) => {
  const response = await api.post('/stock-requests', { items, note });
  return response.data;
};

export const getMyStockRequests = async (status) => {
  const params = status ? { status } : {};
  const response = await api.get('/stock-requests/my', { params });
  return response.data;
};

export const getStockRequestById = async (requestId) => {
  const response = await api.get(`/stock-requests/my/${requestId}`);
  return response.data;
};

export const getMyInventory = async () => {
  const response = await api.get('/stock-requests/inventory/my');
  return response.data;
};

export const getAdminStockRequests = async (params) => {
  const response = await api.get('/admin/stock-requests', { params });
  return response.data;
};

export const getAdminStockRequestById = async (requestId) => {
  const response = await api.get(`/admin/stock-requests/${requestId}`);
  return response.data;
};

export const approveStockRequest = async (requestId, items, note) => {
  const response = await api.post(`/admin/stock-requests/${requestId}/approve`, { items, note });
  return response.data;
};

export const rejectStockRequest = async (requestId, note) => {
  const response = await api.post(`/admin/stock-requests/${requestId}/reject`, { note });
  return response.data;
};

export const getAdminDistributorInventory = async (distributorId) => {
  const response = await api.get(`/admin/distributors/${distributorId}/inventory`);
  return response.data;
};

export const getAllDistributorsInventory = async () => {
  const response = await api.get('/admin/distributors/inventory/all');
  return response.data;
};

export const debugStockRequests = async () => {
  const response = await api.get('/stock-requests/my/debug');
  return response.data;
};