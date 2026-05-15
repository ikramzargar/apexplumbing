import mockData from '@/data/mockData.json';

const staffInvoices = [
  { _id: 'si1', invoice_number: 'SI-2025-001', customer_name: 'Local Customer', total_amount: 4500, status: 'CONFIRMED', createdAt: '2025-05-10T10:00:00Z' },
  { _id: 'si2', invoice_number: 'SI-2025-002', customer_name: 'Walk-in Customer', total_amount: 2300, status: 'PENDING', createdAt: '2025-05-11T14:30:00Z' },
  { _id: 'si3', invoice_number: 'SI-2025-003', customer_name: 'Site Customer', total_amount: 8900, status: 'CONFIRMED', createdAt: '2025-05-12T09:15:00Z' }
];

const staffInventories = [
  { staff_id: '1', staff_name: 'Staff Member', items: mockData.stock.slice(0, 5) }
];

const transfers = [
  { _id: 't1', from: 'Main Stock', to: 'Staff Member', items: [{ name: 'CPVC Pipe 1 inch', quantity: 50 }], status: 'COMPLETED', createdAt: '2025-05-10T10:00:00Z' },
  { _id: 't2', from: 'Main Stock', to: 'Staff Member', items: [{ name: 'Ball Valve 1 inch', quantity: 20 }], status: 'PENDING', createdAt: '2025-05-11T14:30:00Z' }
];

export const getMyInventory = async () => {
  return { data: staffInventories[0]?.items || [] };
};

export const getAllStaffInventories = async (filters = {}) => {
  return { data: staffInventories };
};

export const getStaffNames = async () => {
  return { data: [{ id: '1', name: 'Staff Member' }] };
};

export const transferToStaff = async (transferData) => {
  const newTransfer = {
    _id: `t${Date.now()}`,
    ...transferData,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  transfers.unshift(newTransfer);
  return { data: newTransfer };
};

export const getTransfers = async (filters = {}) => {
  let data = [...transfers];
  if (filters.status) {
    data = data.filter(t => t.status === filters.status);
  }
  return { data };
};

export const createStaffInvoice = async (invoiceData) => {
  const newInvoice = {
    _id: `si${Date.now()}`,
    invoice_number: `SI-2025-${String(staffInvoices.length + 1).padStart(3, '0')}`,
    ...invoiceData,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  staffInvoices.unshift(newInvoice);
  return { data: newInvoice };
};

export const getStaffInvoices = async (filters = {}) => {
  let data = [...staffInvoices];
  if (filters.status) {
    data = data.filter(inv => inv.status === filters.status);
  }
  return { data };
};

export const getStaffInvoice = async (id) => {
  const invoice = staffInvoices.find(inv => inv._id === id);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  return { data: invoice };
};

export const cancelStaffInvoice = async (id) => {
  const index = staffInvoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  staffInvoices[index].status = 'CANCELLED';
  return { data: staffInvoices[index] };
};

export const addStaffInventory = async (inventoryData) => {
  return { data: { success: true, ...inventoryData } };
};

export const sendStaffInvoiceWhatsApp = async (id, phone, name) => {
  return { data: { success: true, message: 'WhatsApp message sent' } };
};

export const updateStaffInvoice = async (id, data) => {
  const index = staffInvoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  staffInvoices[index] = { ...staffInvoices[index], ...data };
  return { data: staffInvoices[index] };
};