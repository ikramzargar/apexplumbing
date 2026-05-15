const locks = [];

export const getActiveLocks = async () => {
  return { data: locks };
};

export const releaseLock = async (productId) => {
  const index = locks.findIndex(l => l.productId === productId);
  if (index !== -1) {
    locks.splice(index, 1);
  }
  return { data: { success: true } };
};

export const releaseAllLocks = async () => {
  locks.length = 0;
  return { data: { success: true } };
};