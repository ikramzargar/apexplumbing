import mockData from '@/data/mockData.json';

export const getMaterials = async (filters = {}) => {
  let data = [...mockData.materials];

  if (filters.category) {
    data = data.filter(m => m.category === filters.category);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter(m =>
      m.name.toLowerCase().includes(search) ||
      m.sku.toLowerCase().includes(search)
    );
  }

  return { data };
};

export const getMaterial = async (id) => {
  const material = mockData.materials.find(m => m._id === id);
  if (!material) {
    const error = new Error('Material not found');
    error.response = { status: 404, data: { message: 'Material not found' } };
    throw error;
  }
  return { data: material };
};

export const getStatements = async (filters = {}) => {
  let data = [...mockData.statements];

  if (filters.type) {
    data = data.filter(s => s.type === filters.type);
  }
  if (filters.period) {
    data = data.filter(s => s.period === filters.period);
  }

  return { data };
};

export const getSupplierStatements = async (supplierId) => {
  let data = [...mockData.supplierStatements];

  if (supplierId) {
    data = data.filter(s => s.supplier_id === supplierId);
  }

  return { data };
};

export const getSupplierStatement = async (id) => {
  const statement = mockData.supplierStatements.find(s => s._id === id);
  if (!statement) {
    const error = new Error('Statement not found');
    error.response = { status: 404, data: { message: 'Statement not found' } };
    throw error;
  }
  return { data: statement };
};

export const getAnalytics = async (type) => {
  const analytics = mockData.analytics;

  switch (type) {
    case 'sales':
      return { data: analytics.salesByCategory };
    case 'district':
      return { data: analytics.salesByDistrict };
    case 'trends':
      return { data: analytics.monthlyTrends };
    case 'products':
      return { data: analytics.topProducts };
    case 'retention':
      return { data: analytics.customerRetention };
    case 'inventory':
      return { data: analytics.inventoryMetrics };
    case 'plumbers':
      return { data: analytics.plumberPerformance };
    default:
      return { data: analytics };
  }
};

export const getAuditLogs = async (filters = {}) => {
  let data = [...mockData.auditLogs];

  if (filters.action) {
    data = data.filter(log => log.action === filters.action);
  }
  if (filters.user_role) {
    data = data.filter(log => log.user_role === filters.user_role);
  }
  if (filters.dateFrom) {
    data = data.filter(log => new Date(log.createdAt) >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    data = data.filter(log => new Date(log.createdAt) <= new Date(filters.dateTo));
  }

  return { data };
};