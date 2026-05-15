import mockData from '@/data/mockData.json';

export const getPayouts = async (filters = {}) => {
  let data = [...mockData.payouts];

  if (filters.status) {
    data = data.filter(p => p.status === filters.status);
  }

  return { data };
};

export const getPendingPayouts = async () => {
  const pending = mockData.payouts.filter(p => p.status === 'PENDING');
  return { data: pending };
};

export const getPendingBalances = async () => {
  const pendingAmount = mockData.payouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);
  return { data: { total: pendingAmount } };
};

export const getPayout = async (id) => {
  const payout = mockData.payouts.find(p => p._id === id);
  if (!payout) {
    const error = new Error('Payout not found');
    error.response = { status: 404, data: { message: 'Payout not found' } };
    throw error;
  }
  return { data: payout };
};

export const createPayout = async (data) => {
  const newPayout = {
    _id: `pay${Date.now()}`,
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  mockData.payouts.unshift(newPayout);
  return { data: newPayout };
};

export const approvePayout = async (id) => {
  const index = mockData.payouts.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Payout not found');
    error.response = { status: 404, data: { message: 'Payout not found' } };
    throw error;
  }
  mockData.payouts[index].status = 'APPROVED';
  return { data: mockData.payouts[index] };
};

export const markPayoutPaid = async (id) => {
  const index = mockData.payouts.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Payout not found');
    error.response = { status: 404, data: { message: 'Payout not found' } };
    throw error;
  }
  mockData.payouts[index].status = 'COMPLETED';
  return { data: mockData.payouts[index] };
};

export const cancelPayout = async (id) => {
  const index = mockData.payouts.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Payout not found');
    error.response = { status: 404, data: { message: 'Payout not found' } };
    throw error;
  }
  mockData.payouts[index].status = 'CANCELLED';
  return { data: mockData.payouts[index] };
};