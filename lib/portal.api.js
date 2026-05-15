import mockData from '@/data/mockData.json';

const portalInvoices = [
  { _id: 'pi1', invoice_number: 'PI-2025-001', items: [{ name: 'CPVC Pipe 1 inch', quantity: 100, price: 62 }], total_amount: 6200, status: 'PENDING', createdAt: '2025-05-10T10:00:00Z' },
  { _id: 'pi2', invoice_number: 'PI-2025-002', items: [{ name: 'Ball Valve 1 inch', quantity: 50, price: 185 }], total_amount: 9250, status: 'APPROVED', createdAt: '2025-05-11T14:30:00Z' },
  { _id: 'pi3', invoice_number: 'PI-2025-003', items: [{ name: 'Water Tank 500L', quantity: 10, price: 4400 }], total_amount: 44000, status: 'COMPLETED', createdAt: '2025-05-12T09:15:00Z' }
];

const portalPayments = [
  { _id: 'pp1', amount: 50000, status: 'COMPLETED', createdAt: '2025-05-01T10:00:00Z' },
  { _id: 'pp2', amount: 25000, status: 'PENDING', createdAt: '2025-05-10T14:30:00Z' }
];

const portalStockTransfers = [
  { _id: 'ps1', from: 'Main Warehouse', items: [{ name: 'CPVC Pipe 1 inch', quantity: 200 }], status: 'COMPLETED', createdAt: '2025-05-05T10:00:00Z' }
];

export const getPortalInvoices = async () => {
  return { data: portalInvoices };
};

export const getPortalInvoice = async (id) => {
  const invoice = portalInvoices.find(inv => inv._id === id);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  return { data: invoice };
};

export const createPortalInvoice = async (data) => {
  const newInvoice = {
    _id: `pi${Date.now()}`,
    invoice_number: `PI-2025-${String(portalInvoices.length + 1).padStart(3, '0')}`,
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  portalInvoices.unshift(newInvoice);
  return { data: newInvoice };
};

export const getPortalStatement = async () => {
  const totalInvoices = portalInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPayments = portalPayments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
  return {
    data: {
      total_invoices: totalInvoices,
      total_payments: totalPayments,
      balance: totalInvoices - totalPayments
    }
  };
};

export const getPortalPayments = async () => {
  return { data: portalPayments };
};

export const getPortalStockTransfers = async () => {
  return { data: portalStockTransfers };
};

export const updatePortalInvoice = async (id, data) => {
  const index = portalInvoices.findIndex(inv => inv._id === id);
  if (index === -1) {
    const error = new Error('Invoice not found');
    error.response = { status: 404, data: { message: 'Invoice not found' } };
    throw error;
  }
  portalInvoices[index] = { ...portalInvoices[index], ...data };
  return { data: portalInvoices[index] };
};