import api from './axios';

export const getDistributors = async () => {
  const response = await api.get('/distributors');
  return response.data;
};

export const getDistributor = async (id) => {
  const response = await api.get(`/distributors/${id}`);
  return response.data;
};

export const createDistributor = async (data) => {
  const response = await api.post('/distributors', data);
  return response.data;
};

export const updateDistributor = async (id, data) => {
  const response = await api.put(`/distributors/${id}`, data);
  return response.data;
};