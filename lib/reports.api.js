import mockData from '@/data/mockData.json';

export const getSalesReport = async (filters = {}) => {
  const invoices = [...mockData.invoices];
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const totalOutstanding = totalSales - totalPaid;

  return {
    data: {
      invoices: invoices.map(inv => ({
        ...inv,
        payment_status: inv.status,
        invoice_type: inv.invoice_type || 'retail'
      })),
      summary: {
        grand_total: totalSales,
        total_paid: totalPaid,
        total_outstanding: totalOutstanding
      }
    }
  };
};

export const getStockReport = async () => {
  const products = mockData.stock.map(item => ({
    ...item,
    is_low_stock: item.current_stock < item.low_stock_threshold
  }));

  return {
    data: {
      products: products,
      total_items: products.length,
      low_stock_count: products.filter(p => p.is_low_stock).length,
      out_of_stock_count: products.filter(p => p.current_stock === 0).length
    }
  };
};

export const getPlumberReport = async (filters = {}) => {
  let plumbers = [...mockData.plumbers];

  if (filters.status && filters.status !== 'all') {
    plumbers = plumbers.filter(p => p.verification_status === filters.status);
  }

  return {
    data: plumbers
  };
};

export const getOutstandingReport = async () => {
  const outstandingInvoices = mockData.invoices
    .filter(inv => inv.status !== 'PAID')
    .map((inv, index) => ({
      ...inv,
      customer: inv.customer_name,
      plumber: null,
      amount: inv.total_amount,
      paid: inv.paid_amount,
      balance: inv.total_amount - inv.paid_amount,
      days_overdue: Math.floor(Math.random() * 60) + 1
    }));

  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return {
    data: {
      invoices: outstandingInvoices,
      totals: {
        total_outstanding: totalOutstanding,
        count: outstandingInvoices.length
      }
    }
  };
};

export const getDistrictReport = async (filters = {}) => {
  const districts = [...new Set(mockData.plumbers.map(p => p.district))];

  const districtData = districts.map(d => {
    const districtPlumbers = mockData.plumbers.filter(p => p.district === d);
    const plumberCount = districtPlumbers.length;
    const referralCount = districtPlumbers.reduce((sum, p) => sum + p.referralCount, 0);
    const invoiceCount = Math.floor(Math.random() * 50) + 10;
    const totalSales = Math.floor(Math.random() * 500000) + 100000;

    return {
      _id: d.toLowerCase().replace(/\s+/g, '-'),
      district: d,
      invoice_count: invoiceCount,
      total_sales: totalSales,
      plumber_count: plumberCount,
      total_referrals: referralCount
    };
  });

  return {
    data: {
      districts: districtData,
      total_invoices: districtData.reduce((sum, d) => sum + d.invoice_count, 0),
      total_sales: districtData.reduce((sum, d) => sum + d.total_sales, 0)
    }
  };
};

export const getStaffReport = async (filters = {}) => {
  const staffList = [
    { staff_id: '1', staff_name: 'Admin User', staff_role: 'admin', invoice_count: 45, collected_revenue: 456780, total_paid: 456780, outstanding: 23450 },
    { staff_id: '2', staff_name: 'Staff Member', staff_role: 'staff', invoice_count: 78, collected_revenue: 678900, total_paid: 678900, outstanding: 45670 }
  ];

  const monthly_breakdown = [
    { year: 2025, month: 1, invoice_count: 12, total_revenue: 145670 },
    { year: 2025, month: 2, invoice_count: 15, total_revenue: 178900 },
    { year: 2025, month: 3, invoice_count: 18, total_revenue: 198450 },
    { year: 2025, month: 4, invoice_count: 20, total_revenue: 234560 },
    { year: 2025, month: 5, invoice_count: 13, total_revenue: 156780 }
  ];

  const top_products = [
    { product_name: 'CPVC Pipe 1 inch', total_qty: 1250, total_revenue: 97500 },
    { product_name: 'Water Tank 1000L', total_qty: 45, total_revenue: 364500 },
    { product_name: 'Tap Mixer Premium', total_qty: 89, total_revenue: 155750 },
    { product_name: 'Ball Valve 1 inch', total_qty: 234, total_revenue: 51480 }
  ];

  return {
    data: {
      totals: {
        total_staff: staffList.length,
        total_invoices: staffList.reduce((sum, s) => sum + s.invoice_count, 0),
        total_revenue: staffList.reduce((sum, s) => sum + s.collected_revenue, 0),
        total_paid: staffList.reduce((sum, s) => sum + s.total_paid, 0),
        total_outstanding: staffList.reduce((sum, s) => sum + s.outstanding, 0)
      },
      staff: staffList,
      overview: {
        total_invoices: 123,
        total_revenue: 1135680,
        total_outstanding: 69120
      },
      sales_today: 45670,
      sales_today_count: 5,
      sales_month: 456780,
      sales_month_count: 45,
      sales_year: 1135680,
      sales_year_count: 123,
      gross_month: 456780,
      monthly_breakdown,
      top_products
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