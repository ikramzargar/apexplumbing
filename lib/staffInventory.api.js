import api from './axios';

export const getMyInventory = async () => {
  const { data } = await api.get('/staff-inventory/my');
  return data.data;
};

export const getAllStaffInventories = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/staff-inventory/all?${params}`);
  return data;
};

export const getStaffNames = async () => {
  const { data } = await api.get('/staff-inventory/staff');
  return data;
};

export const transferToStaff = async (transferData) => {
  const { data } = await api.post('/staff-inventory/transfer', transferData);
  return data;
};

export const getTransfers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/staff-inventory/transfers?${params}`);
  return data;
};

export const createStaffInvoice = async (invoiceData) => {
  const { data } = await api.post('/staff-inventory/invoices', invoiceData);
  return data;
};

export const getStaffInvoices = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/staff-inventory/invoices?${params}`);
  return data;
};

export const getStaffInvoice = async (id) => {
  const { data } = await api.get(`/staff-inventory/invoices/${id}`);
  return data;
};

export const cancelStaffInvoice = async (id) => {
  const { data } = await api.patch(`/staff-inventory/invoices/${id}/cancel`);
  return data;
};

export const addStaffInventory = async (inventoryData) => {
  const { data } = await api.post('/staff-inventory/add', inventoryData);
  return data;
};

export const sendStaffInvoiceWhatsApp = async (id, phone, name) => {
  const { data } = await api.post(`/staff-inventory/invoices/${id}/send-whatsapp`, { phone, name });
  return data;
};

export const updateStaffInvoice = async (id, data) => {
  const { data: response } = await api.put(`/staff-inventory/invoices/${id}`, data);
  return response;
};