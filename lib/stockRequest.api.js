import mockData from '@/data/mockData.json';

const stockRequests = [
  { _id: 'sr1', items: [{ product_id: 's1', name: 'CPVC Pipe 1 inch', quantity: 100 }], status: 'PENDING', createdAt: '2025-05-10T10:00:00Z' },
  { _id: 'sr2', items: [{ product_id: 's3', name: 'Ball Valve 1 inch', quantity: 50 }], status: 'APPROVED', createdAt: '2025-05-09T14:30:00Z' }
];

export const createStockRequest = async (items, note) => {
  const newRequest = {
    _id: `sr${Date.now()}`,
    items,
    note,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  stockRequests.unshift(newRequest);
  return { data: newRequest };
};

export const getMyStockRequests = async (status) => {
  let data = [...stockRequests];
  if (status) {
    data = data.filter(r => r.status === status);
  }
  return { data };
};

export const getStockRequestById = async (requestId) => {
  const request = stockRequests.find(r => r._id === requestId);
  if (!request) {
    const error = new Error('Request not found');
    error.response = { status: 404, data: { message: 'Request not found' } };
    throw error;
  }
  return { data: request };
};

export const getMyInventory = async () => {
  return { data: mockData.stock.slice(0, 5) };
};

export const getAdminStockRequests = async (params) => {
  let data = [...stockRequests];
  if (params?.status) {
    data = data.filter(r => r.status === params.status);
  }
  return { data };
};

export const getAdminStockRequestById = async (requestId) => {
  return getStockRequestById(requestId);
};

export const approveStockRequest = async (requestId, items, note) => {
  const index = stockRequests.findIndex(r => r._id === requestId);
  if (index === -1) {
    const error = new Error('Request not found');
    error.response = { status: 404, data: { message: 'Request not found' } };
    throw error;
  }
  stockRequests[index].status = 'APPROVED';
  return { data: stockRequests[index] };
};

export const rejectStockRequest = async (requestId, note) => {
  const index = stockRequests.findIndex(r => r._id === requestId);
  if (index === -1) {
    const error = new Error('Request not found');
    error.response = { status: 404, data: { message: 'Request not found' } };
    throw error;
  }
  stockRequests[index].status = 'REJECTED';
  return { data: stockRequests[index] };
};

export const getAdminDistributorInventory = async (distributorId) => {
  return { data: mockData.stock.slice(0, 3) };
};

export const getAllDistributorsInventory = async () => {
  return { data: mockData.distributors.map(d => ({ ...d, inventory: mockData.stock.slice(0, 5) })) };
};

export const debugStockRequests = async () => {
  return { data: stockRequests };
};