import api from './axios';

export const getAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/audit${params ? `?${params}` : ''}`);
  return data;
};

export const getAuditSummary = async (dateFrom, dateTo) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  const { data } = await api.get(`/audit/summary?${params.toString()}`);
  return data;
};