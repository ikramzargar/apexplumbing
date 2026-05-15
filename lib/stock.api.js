import mockData from '@/data/mockData.json';

export const getCurrentStock = async (queryString = '') => {
  let data = [...mockData.stock];

  if (queryString) {
    const params = new URLSearchParams(queryString.replace('?', ''));
    const category = params.get('category');
    const search = params.get('search');

    if (category && category !== 'all') {
      data = data.filter(item => item.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower)
      );
    }
  }

  return { data: { products: data, pagination: { total: data.length } } };
};

export const stockIn = async (data) => {
  const newMovement = {
    _id: `mov${Date.now()}`,
    type: 'IN',
    quantity: data.quantity,
    reference: `Manual Stock In`,
    date: new Date().toISOString(),
    performed_by: 'Admin User'
  };
  mockData.stockMovements.unshift(newMovement);
  return { data: newMovement };
};

export const manualStockOut = async (data) => {
  const newMovement = {
    _id: `mov${Date.now()}`,
    type: 'OUT',
    quantity: data.quantity,
    reference: data.reason || 'Manual Stock Out',
    date: new Date().toISOString(),
    performed_by: 'Staff User'
  };
  mockData.stockMovements.unshift(newMovement);
  return { data: newMovement };
};

export const getMovements = async (filters = {}) => {
  let data = [...mockData.stockMovements];

  if (filters.type && filters.type !== 'all') {
    data = data.filter(item => item.type === filters.type);
  }
  if (filters.product_name) {
    data = data.filter(item => item.product_name.toLowerCase().includes(filters.product_name.toLowerCase()));
  }

  return { data: { movements: data, pagination: { total: data.length } } };
};

export const getLowStock = async () => {
  return { data: { items: mockData.lowStockItems, pagination: { total: mockData.lowStockItems.length } } };
};