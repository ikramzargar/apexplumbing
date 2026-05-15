import mockData from '@/data/mockData.json';

export const getPlumbers = async (filters = {}) => {
  let data = [...mockData.plumbers];

  if (filters.verification_status && filters.verification_status !== 'all') {
    data = data.filter(p => p.verification_status === filters.verification_status);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter(p =>
      p.full_name.toLowerCase().includes(search) ||
      p.phone.includes(search) ||
      p.district.toLowerCase().includes(search)
    );
  }

  const limit = parseInt(filters.limit) || data.length;
  const paginatedData = data.slice(0, limit);

  return {
    data: {
      plumbers: paginatedData,
      pagination: { total: data.length }
    }
  };
};

export const getPlumber = async (id) => {
  const plumber = mockData.plumbers.find(p => p._id === id);
  if (!plumber) {
    const error = new Error('Plumber not found');
    error.response = { status: 404, data: { message: 'Plumber not found' } };
    throw error;
  }
  return { data: plumber };
};

export const createPlumber = async (data) => {
  const newPlumber = {
    _id: `pl${Date.now()}`,
    ...data,
    verification_status: 'PENDING',
    referralCount: 0,
    totalBonus: 0,
    createdAt: new Date().toISOString()
  };
  mockData.plumbers.unshift(newPlumber);
  return { data: newPlumber };
};

export const updatePlumber = async (id, data) => {
  const index = mockData.plumbers.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Plumber not found');
    error.response = { status: 404, data: { message: 'Plumber not found' } };
    throw error;
  }
  mockData.plumbers[index] = { ...mockData.plumbers[index], ...data };
  return { data: mockData.plumbers[index] };
};

export const verifyPlumber = async (id, status) => {
  const index = mockData.plumbers.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Plumber not found');
    error.response = { status: 404, data: { message: 'Plumber not found' } };
    throw error;
  }
  mockData.plumbers[index].verification_status = status;
  return { data: mockData.plumbers[index] };
};

export const deletePlumber = async (id) => {
  const index = mockData.plumbers.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Plumber not found');
    error.response = { status: 404, data: { message: 'Plumber not found' } };
    throw error;
  }
  mockData.plumbers.splice(index, 1);
  return { data: { success: true } };
};

export const getPlumberBonuses = async (id) => {
  const plumber = mockData.plumbers.find(p => p._id === id);
  const bonuses = mockData.plumberBonuses.filter(b => b.plumber_id === id);
  return { data: bonuses };
};

export const getPlumberPayouts = async (id) => {
  const plumber = mockData.plumbers.find(p => p._id === id);
  if (!plumber) {
    return { data: [] };
  }
  const payouts = [
    { _id: 'pp1', amount: 15000, status: 'COMPLETED', method: 'Bank Transfer', reference_number: 'TXN123456', createdAt: '2025-05-01T10:00:00Z' },
    { _id: 'pp2', amount: 12000, status: 'COMPLETED', method: 'Bank Transfer', reference_number: 'TXN123457', createdAt: '2025-04-15T14:30:00Z' },
    { _id: 'pp3', amount: 8000, status: 'PENDING', method: 'Bank Transfer', reference_number: null, createdAt: '2025-05-10T09:00:00Z' }
  ];
  return { data: payouts };
};

export const getPlumberByReferralCode = async (code) => {
  const plumber = mockData.plumbers.find(p => p.referral_code === code);
  if (!plumber) {
    const error = new Error('Plumber not found');
    error.response = { status: 404, data: { message: 'Plumber not found' } };
    throw error;
  }
  return { data: plumber };
};

export const getPlumberInvoices = async (plumberId) => {
  const invoices = mockData.plumberInvoices.filter(inv => inv.plumber_id === plumberId);
  return { data: invoices };
};

export const getPlumberDetails = async () => {
  return { data: mockData.plumberDetails };
};

export const getPlumberById = async (id) => {
  const plumber = mockData.plumbers.find(p => p._id === id);
  if (!plumber) {
    const error = new Error('Plumber not found');
    error.response = { status: 404, data: { message: 'Plumber not found' } };
    throw error;
  }

  const invoices = mockData.plumberInvoices.filter(inv => inv.plumber_id === id);
  const bonuses = mockData.plumberBonuses.filter(b => b.plumber_id === id);

  return {
    data: {
      ...plumber,
      invoices,
      bonuses
    }
  };
};