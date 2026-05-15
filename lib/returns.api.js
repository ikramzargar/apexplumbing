import mockData from '@/data/mockData.json';

export const getReturns = async (filters = {}) => {
  let data = [...mockData.returns];

  if (filters.status) {
    data = data.filter(r => r.status === filters.status);
  }

  return { data };
};

export const getReturn = async (id) => {
  const returnItem = mockData.returns.find(r => r._id === id);
  if (!returnItem) {
    const error = new Error('Return not found');
    error.response = { status: 404, data: { message: 'Return not found' } };
    throw error;
  }
  return { data: returnItem };
};

export const createSalesReturn = async (data) => {
  const newReturn = {
    _id: `ret${Date.now()}`,
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  mockData.returns.unshift(newReturn);
  return { data: newReturn };
};

export const createSupplierReturn = async (data) => {
  const newReturn = {
    _id: `ret${Date.now()}`,
    ...data,
    status: 'PENDING',
    type: 'SUPPLIER',
    createdAt: new Date().toISOString()
  };
  mockData.returns.unshift(newReturn);
  return { data: newReturn };
};

export const approveReturn = async (id) => {
  const index = mockData.returns.findIndex(r => r._id === id);
  if (index === -1) {
    const error = new Error('Return not found');
    error.response = { status: 404, data: { message: 'Return not found' } };
    throw error;
  }
  mockData.returns[index].status = 'APPROVED';
  return { data: mockData.returns[index] };
};

export const rejectReturn = async (id) => {
  const index = mockData.returns.findIndex(r => r._id === id);
  if (index === -1) {
    const error = new Error('Return not found');
    error.response = { status: 404, data: { message: 'Return not found' } };
    throw error;
  }
  mockData.returns[index].status = 'REJECTED';
  return { data: mockData.returns[index] };
};