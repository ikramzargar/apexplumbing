import mockData from '@/data/mockData.json';

export const getSuppliers = async (filters = {}) => {
  let data = [...mockData.suppliers];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.contact_person.toLowerCase().includes(search)
    );
  }

  return { data: { suppliers: data, pagination: { total: data.length } } };
};

export const getSupplier = async (id) => {
  const supplier = mockData.suppliers.find(s => s._id === id);
  if (!supplier) {
    const error = new Error('Supplier not found');
    error.response = { status: 404, data: { message: 'Supplier not found' } };
    throw error;
  }
  return { data: supplier };
};

export const createSupplier = async (data) => {
  const newSupplier = {
    _id: `sup${Date.now()}`,
    ...data,
    outstanding: 0,
    createdAt: new Date().toISOString()
  };
  mockData.suppliers.unshift(newSupplier);
  return { data: newSupplier };
};

export const updateSupplier = async (id, data) => {
  const index = mockData.suppliers.findIndex(s => s._id === id);
  if (index === -1) {
    const error = new Error('Supplier not found');
    error.response = { status: 404, data: { message: 'Supplier not found' } };
    throw error;
  }
  mockData.suppliers[index] = { ...mockData.suppliers[index], ...data };
  return { data: mockData.suppliers[index] };
};

export const deleteSupplier = async (id) => {
  const index = mockData.suppliers.findIndex(s => s._id === id);
  if (index === -1) {
    const error = new Error('Supplier not found');
    error.response = { status: 404, data: { message: 'Supplier not found' } };
    throw error;
  }
  mockData.suppliers.splice(index, 1);
  return { data: { success: true } };
};