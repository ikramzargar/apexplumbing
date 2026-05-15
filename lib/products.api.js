import mockData from '@/data/mockData.json';

export const getProducts = async (filters = {}) => {
  let data = [...mockData.products];

  if (filters.category) {
    data = data.filter(p => p.category === filters.category);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    );
  }

  return { data };
};

export const getProduct = async (id) => {
  const product = mockData.products.find(p => p._id === id);
  if (!product) {
    const error = new Error('Product not found');
    error.response = { status: 404, data: { message: 'Product not found' } };
    throw error;
  }
  return { data: product };
};

export const createProduct = async (data) => {
  const newProduct = {
    _id: `prod${Date.now()}`,
    ...data,
    stock: 0
  };
  mockData.products.unshift(newProduct);
  return { data: newProduct };
};

export const updateProduct = async (id, data) => {
  const index = mockData.products.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Product not found');
    error.response = { status: 404, data: { message: 'Product not found' } };
    throw error;
  }
  mockData.products[index] = { ...mockData.products[index], ...data };
  return { data: mockData.products[index] };
};

export const deactivateProduct = async (id) => {
  const index = mockData.products.findIndex(p => p._id === id);
  if (index === -1) {
    const error = new Error('Product not found');
    error.response = { status: 404, data: { message: 'Product not found' } };
    throw error;
  }
  mockData.products[index].active = false;
  return { data: mockData.products[index] };
};