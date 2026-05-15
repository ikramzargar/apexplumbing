import api from './axios';

export const getReturns = async (filters = {}) => {
  const response = await api.get('/returns', { params: filters });
  return response.data;
};

export const getReturn = async (id) => {
  const response = await api.get(`/returns/${id}`);
  return response.data;
};

export const createSalesReturn = async (data) => {
  const response = await api.post('/returns/sales', data);
  return response.data;
};

export const createSupplierReturn = async (data) => {
  const response = await api.post('/returns/supplier', data);
  return response.data;
};

export const approveReturn = async (id) => {
  const response = await api.put(`/returns/${id}/approve`);
  return response.data;
};

export const rejectReturn = async (id) => {
  const response = await api.put(`/returns/${id}/reject`);
  return response.data;
};