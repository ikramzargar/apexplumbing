import api from './axios';

export const getPayouts = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/payouts${params ? `?${params}` : ''}`);
  return response.data;
};

export const getPendingPayouts = async () => {
  const response = await api.get('/payouts/pending');
  return response.data;
};

export const getPendingBalances = async () => {
  const response = await api.get('/payouts/pending-balances');
  return response.data;
};

export const getPayout = async (id) => {
  const response = await api.get(`/payouts/${id}`);
  return response.data;
};

export const createPayout = async (data) => {
  const response = await api.post('/payouts', data);
  return response.data;
};

export const approvePayout = async (id) => {
  const response = await api.patch(`/payouts/${id}/approve`);
  return response.data;
};

export const markPayoutPaid = async (id) => {
  const response = await api.patch(`/payouts/${id}/mark-paid`);
  return response.data;
};

export const cancelPayout = async (id) => {
  const response = await api.patch(`/payouts/${id}/cancel`);
  return response.data;
};