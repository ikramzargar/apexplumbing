import mockData from '@/data/mockData.json';

export const searchCustomers = async (search) => {
  const searchLower = search.toLowerCase();
  const results = mockData.customers.filter(c =>
    c.name.toLowerCase().includes(searchLower) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(searchLower)
  );
  console.log('Customer search results:', results);
  return { data: results };
};

export const getCustomerByPhone = async (phone) => {
  const customer = mockData.customers.find(c => c.phone === phone);
  if (!customer) {
    const error = new Error('Customer not found');
    error.response = { status: 404, data: { message: 'Customer not found' } };
    throw error;
  }
  return { data: customer };
};