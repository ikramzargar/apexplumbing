import mockData from '@/data/mockData.json';

export const getSalesReport = async (filters = {}) => {
  return {
    data: {
      total_sales: 15428740,
      total_invoices: 156,
      average_order_value: 98876,
      sales_by_date: mockData.dashboard.salesChart.day
    }
  };
};

export const getStockReport = async () => {
  return {
    data: {
      total_items: mockData.stock.length,
      total_value: mockData.stock.reduce((sum, item) => sum + (item.current_stock * item.mrp), 0),
      low_stock_items: mockData.lowStockItems.length,
      items: mockData.stock
    }
  };
};

export const getPlumberReport = async (filters = {}) => {
  return {
    data: {
      total_plumbers: mockData.plumbers.length,
      verified: mockData.plumbers.filter(p => p.verification_status === 'VERIFIED').length,
      pending: mockData.plumbers.filter(p => p.verification_status === 'PENDING').length,
      top_performers: mockData.dashboard.topPlumbers
    }
  };
};

export const getOutstandingReport = async () => {
  const outstandingInvoices = mockData.invoices.filter(inv => inv.status !== 'PAID');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  return {
    data: {
      total_outstanding: totalOutstanding,
      invoice_count: outstandingInvoices.length,
      invoices: outstandingInvoices
    }
  };
};

export const getDistrictReport = async (filters = {}) => {
  const districts = [...new Set(mockData.plumbers.map(p => p.district))];
  return {
    data: districts.map(d => ({
      district: d,
      plumber_count: mockData.plumbers.filter(p => p.district === d).length,
      total_referrals: mockData.plumbers.filter(p => p.district === d).reduce((sum, p) => sum + p.referralCount, 0)
    }))
  };
};

export const getStaffReport = async (filters = {}) => {
  return {
    data: {
      total_invoices: 45,
      total_sales: 456780,
      confirmed_invoices: 38,
      pending_invoices: 7
    }
  };
};

export const getUserReport = async (userId, filters = {}) => {
  return {
    data: {
      user_id: userId,
      total_invoices: 45,
      total_sales: 456780,
      period: filters
    }
  };
};