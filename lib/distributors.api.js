import mockData from '@/data/mockData.json';

export const getDistributors = async () => {
  return { data: mockData.distributors };
};

export const getDistributor = async (id) => {
  const distributor = mockData.distributors.find(d => d._id === id);
  if (!distributor) {
    const error = new Error('Distributor not found');
    error.response = { status: 404, data: { message: 'Distributor not found' } };
    throw error;
  }
  return { data: distributor };
};

export const createDistributor = async (data) => {
  const newDistributor = {
    _id: `dist${Date.now()}`,
    ...data,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };
  mockData.distributors.unshift(newDistributor);
  return { data: newDistributor };
};

export const updateDistributor = async (id, data) => {
  const index = mockData.distributors.findIndex(d => d._id === id);
  if (index === -1) {
    const error = new Error('Distributor not found');
    error.response = { status: 404, data: { message: 'Distributor not found' } };
    throw error;
  }
  mockData.distributors[index] = { ...mockData.distributors[index], ...data };
  return { data: mockData.distributors[index] };
};