import mockData from '@/data/mockData.json';

export const loginUser = async (email, password) => {
  const user = mockData.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    const error = new Error('Invalid email or password');
    error.response = { status: 401, data: { message: 'Invalid email or password' } };
    throw error;
  }

  const token = btoa(`${user.id}:${Date.now()}`);
  const { password: _, ...userWithoutPassword } = user;

  return {
    data: {
      token,
      user: userWithoutPassword,
    },
  };
};

export const loginDistributor = async (portalEmail, password) => {
  const user = mockData.users.find(
    (u) => u.portalEmail === portalEmail && u.password === password
  );

  if (!user) {
    const error = new Error('Invalid portal email or password');
    error.response = { status: 401, data: { message: 'Invalid portal email or password' } };
    throw error;
  }

  const token = btoa(`${user.id}:${Date.now()}`);
  const { password: _, ...userWithoutPassword } = user;

  return {
    data: {
      token,
      user: userWithoutPassword,
    },
  };
};

export const getMe = async () => {
  const storedUser = typeof window !== 'undefined'
    ? localStorage.getItem('user')
    : null;

  if (!storedUser) {
    const error = new Error('Not authenticated');
    error.response = { status: 401, data: { message: 'Not authenticated' } };
    throw error;
  }

  return {
    data: JSON.parse(storedUser),
  };
};