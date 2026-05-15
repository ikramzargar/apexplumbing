import api from './axios';

export const getInvoices = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/invoices${params ? `?${params}` : ''}`);
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const createRetailInvoice = async (data) => {
  const response = await api.post('/invoices/retail', data);
  return response.data;
};

export const createWholesaleInvoice = async (data) => {
  const response = await api.post('/invoices/wholesale', data);
  return response.data;
};

export const confirmInvoice = async (id, allowOverride = false) => {
  const response = await api.patch(`/invoices/${id}/confirm`, { allowOverride });
  return response.data;
};

export const cancelInvoice = async (id) => {
  const response = await api.patch(`/invoices/${id}/cancel`);
  return response.data;
};

export const addPayment = async (id, data) => {
  const response = await api.post(`/invoices/${id}/payment`, data);
  return response.data;
};

export const getOutstanding = async () => {
  const response = await api.get('/invoices/outstanding');
  return response.data;
};

export const getMyInvoices = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/invoices/my-invoices${params ? `?${params}` : ''}`);
  return response.data;
};

export const updateInvoice = async (id, data) => {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
};

export const markAsPaid = async (id) => {
  const response = await api.patch(`/invoices/${id}/mark-paid`);
  return response.data;
};

export const markAsUnpaid = async (id) => {
  const response = await api.patch(`/invoices/${id}/mark-unpaid`);
  return response.data;
};

export const sendInvoiceWhatsApp = async (id, phone, name) => {
  const response = await api.post(`/invoices/${id}/send-whatsapp`, { phone, name });
  return response.data;
};

export const getStockTransferInvoices = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/invoices/stock-transfers${params ? `?${params}` : ''}`);
  return response.data;
};