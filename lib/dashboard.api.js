import mockData from '@/data/mockData.json';

export const getDashboardStats = async () => {
  return { data: mockData.dashboard.stats };
};

export const getSalesChart = async (dateFrom, dateTo, groupBy) => {
  const data = groupBy === 'month' ? mockData.dashboard.salesChart.month : mockData.dashboard.salesChart.day;
  return { data };
};

export const getTopPlumbers = async (limit = 5) => {
  return { data: mockData.dashboard.topPlumbers.slice(0, limit) };
};