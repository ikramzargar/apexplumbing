import mockData from '@/data/mockData.json';

export const getInvoices = async (filters = {}) => {
  let data = [...mockData.invoices];

  if (filters.status) {
    data = data.filter(inv => inv.status === filters.status);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter(inv =>
      inv.invoice_number.toLowerCase().includes(search) ||
      inv.customer_name.toLowerCase().includes(search)
    );
  }

  return { data };
};

export const getInvoice = async (id) => {
  const invoice = mockData.invoices.find(inv => inv._id === id);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  return { data: invoice };
};

export const createRetailInvoice = async (data) => {
  const newInvoice = {
    _id: `inv${Date.now()}`,
    invoice_number: `INV-2025-${String(mockData.invoices.length + 1).padStart(4, '0')}`,
    ...data,
    status: 'UNPAID',
    paid_amount: 0,
    createdAt: new Date().toISOString()
  };
  mockData.invoices.unshift(newInvoice);
  return { data: newInvoice };
};

export const createWholesaleInvoice = async (data) => {
  const newInvoice = {
    _id: `inv${Date.now()}`,
    invoice_number: `INV-2025-${String(mockData.invoices.length + 1).padStart(4, '0')}`,
    ...data,
    status: 'UNPAID',
    paid_amount: 0,
    createdAt: new Date().toISOString()
  };
  mockData.invoices.unshift(newInvoice);
  return { data: newInvoice };
};

export const confirmInvoice = async (id, allowOverride = false) => {
  const index = mockData.invoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  mockData.invoices[index].status = 'PAID';
  return { data: mockData.invoices[index] };
};

export const cancelInvoice = async (id) => {
  const index = mockData.invoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  mockData.invoices[index].status = 'CANCELLED';
  return { data: mockData.invoices[index] };
};

export const addPayment = async (id, data) => {
  const index = mockData.invoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  mockData.invoices[index].paid_amount += data.amount;
  if (mockData.invoices[index].paid_amount >= mockData.invoices[index].total_amount) {
    mockData.invoices[index].status = 'PAID';
  } else {
    mockData.invoices[index].status = 'PARTIAL';
  }
  return { data: mockData.invoices[index] };
};

export const getOutstanding = async () => {
  const outstanding = mockData.invoices
    .filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  return { data: outstanding };
};

export const getMyInvoices = async (filters = {}) => {
  return getInvoices(filters);
};

export const updateInvoice = async (id, data) => {
  const index = mockData.invoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  mockData.invoices[index] = { ...mockData.invoices[index], ...data };
  return { data: mockData.invoices[index] };
};

export const markAsPaid = async (id) => {
  return confirmInvoice(id);
};

export const markAsUnpaid = async (id) => {
  const index = mockData.invoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  mockData.invoices[index].status = 'UNPAID';
  mockData.invoices[index].paid_amount = 0;
  return { data: mockData.invoices[index] };
};

export const sendInvoiceWhatsApp = async (id, phone, name) => {
  return { data: { success: true, message: 'WhatsApp message sent' } };
};

export const getStockTransferInvoices = async (filters = {}) => {
  return { data: [] };
};