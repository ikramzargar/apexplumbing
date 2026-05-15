import api from '@/lib/axios';

export const getActiveLocks = async () => {
  const response = await api.get('/stock/locks');
  return response.data;
};

export const releaseLock = async (productId) => {
  const response = await api.delete(`/stock/locks/${productId}`);
  return response.data;
};

export const releaseAllLocks = async () => {
  const response = await api.delete('/stock/locks');
  return response.data;
};