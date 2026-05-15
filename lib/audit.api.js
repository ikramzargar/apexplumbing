import mockData from '@/data/mockData.json';

const auditLogs = [
  { _id: 'al1', action: 'USER_LOGIN', user: 'Admin User', details: 'Logged in successfully', createdAt: '2025-05-15T10:00:00Z' },
  { _id: 'al2', action: 'INVOICE_CREATED', user: 'Admin User', details: 'Invoice INV-2025-0001 created', createdAt: '2025-05-14T14:30:00Z' },
  { _id: 'al3', action: 'STOCK_UPDATE', user: 'Admin User', details: 'Stock updated for CPVC Pipe 1 inch', createdAt: '2025-05-13T09:15:00Z' },
  { _id: 'al4', action: 'PLUMBER_VERIFIED', user: 'Admin User', details: 'Plumber Ramesh Kumar verified', createdAt: '2025-05-12T16:45:00Z' }
];

export const getAuditLogs = async (filters = {}) => {
  let data = [...auditLogs];

  if (filters.action) {
    data = data.filter(log => log.action === filters.action);
  }
  if (filters.dateFrom) {
    data = data.filter(log => new Date(log.createdAt) >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    data = data.filter(log => new Date(log.createdAt) <= new Date(filters.dateTo));
  }

  return {
    data: {
      logs: data,
      pagination: { page: 1, pages: 1, total: data.length }
    }
  };
};

export const getAuditSummary = async (dateFrom, dateTo) => {
  let data = [...auditLogs];

  if (dateFrom) {
    data = data.filter(log => new Date(log.createdAt) >= new Date(dateFrom));
  }
  if (dateTo) {
    data = data.filter(log => new Date(log.createdAt) <= new Date(dateTo));
  }

  const actionCounts = data.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  const actionStats = Object.entries(actionCounts).map(([action, count]) => ({
    _id: action,
    count
  }));

  return { data: { total: data.length, actionStats } };
};