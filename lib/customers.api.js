import api from './axios';

export const searchCustomers = async (search) => {
  const params = new URLSearchParams({ search });
  console.log('Searching customers with query:', params.toString());
  const response = await api.get(`/customers?${params}`);
  console.log('Customer search response:', response.data);
  return response.data;
};

export const getCustomerByPhone = async (phone) => {
  const response = await api.get(`/customers/phone/${phone}`);
  return response.data;
};