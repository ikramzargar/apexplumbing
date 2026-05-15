import api from './axios';

export const getPortalInvoices = async () => {
  const response = await api.get('/portal/invoices');
  return response.data;
};

export const getPortalInvoice = async (id) => {
  const response = await api.get(`/portal/invoices/${id}`);
  return response.data;
};

export const createPortalInvoice = async (data) => {
  const response = await api.post('/portal/invoices', data);
  return response.data;
};

export const getPortalStatement = async () => {
  const response = await api.get('/portal/statements');
  return response.data;
};

export const getPortalPayments = async () => {
  const response = await api.get('/portal/payments');
  return response.data;
};

export const getPortalStockTransfers = async () => {
  const response = await api.get('/portal/stock-transfers');
  return response.data;
};

export const updatePortalInvoice = async (id, data) => {
  const response = await api.put(`/portal/invoices/${id}`, data);
  return response.data;
};