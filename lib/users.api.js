import api from './axios';

export const getUsers = async (params = {}) => {
  console.log('getUsers called with params:', params);
  const query = new URLSearchParams(params).toString();
  console.log('Query string:', query);
  const response = await api.get(`/users${query ? `?${query}` : ''}`);
  console.log('API response:', response.data);
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await api.patch(`/users/${id}/deactivate`);
  return response.data;
};

export const reactivateUser = async (id) => {
  const response = await api.patch(`/users/${id}/reactivate`);
  return response.data;
};