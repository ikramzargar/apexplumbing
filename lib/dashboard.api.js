import api from './axios';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getSalesChart = async (dateFrom, dateTo, groupBy) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  if (groupBy) params.append('groupBy', groupBy);
  const response = await api.get(`/dashboard/sales-chart?${params.toString()}`);
  return response.data;
};

export const getTopPlumbers = async (limit = 5) => {
  const response = await api.get(`/dashboard/top-plumbers?limit=${limit}`);
  return response.data;
};