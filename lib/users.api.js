import mockData from '@/data/mockData.json';

export const getUsers = async (params = {}) => {
  console.log('getUsers called with params:', params);
  let data = [...mockData.users];

  if (params.role && params.role !== 'all') {
    data = data.filter(u => u.role === params.role);
  }
  if (params.search) {
    const search = params.search.toLowerCase();
    data = data.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  console.log('Returning users:', data);
  return { data: { users: data } };
};

export const getUser = async (id) => {
  const user = mockData.users.find(u => u.id === id);
  if (!user) {
    const error = new Error('User not found');
    error.response = { status: 404, data: { message: 'User not found' } };
    throw error;
  }
  return { data: user };
};

export const createUser = async (data) => {
  const newUser = {
    id: String(mockData.users.length + 1),
    ...data,
    createdAt: new Date().toISOString()
  };
  mockData.users.push(newUser);
  return { data: newUser };
};

export const updateUser = async (id, data) => {
  const index = mockData.users.findIndex(u => u.id === id);
  if (index === -1) {
    const error = new Error('User not found');
    error.response = { status: 404, data: { message: 'User not found' } };
    throw error;
  }
  mockData.users[index] = { ...mockData.users[index], ...data };
  return { data: mockData.users[index] };
};

export const deactivateUser = async (id) => {
  const index = mockData.users.findIndex(u => u.id === id);
  if (index === -1) {
    const error = new Error('User not found');
    error.response = { status: 404, data: { message: 'User not found' } };
    throw error;
  }
  mockData.users[index].is_active = false;
  return { data: mockData.users[index] };
};

export const reactivateUser = async (id) => {
  const index = mockData.users.findIndex(u => u.id === id);
  if (index === -1) {
    const error = new Error('User not found');
    error.response = { status: 404, data: { message: 'User not found' } };
    throw error;
  }
  mockData.users[index].is_active = true;
  return { data: mockData.users[index] };
};