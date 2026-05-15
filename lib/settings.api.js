const settings = {
  company_name: 'APEX PLUMBING',
  company_address: '123 Business Park, Kashmir',
  company_phone: '9876543210',
  company_email: 'info@apexplumbing.com',
  gst_number: '27AABCS1234C1Z5',
  invoice_prefix: 'INV',
  low_stock_threshold_default: 100,
  referral_bonus_amount: 1500,
  payout_schedule: 'weekly'
};

export const getSettings = async () => {
  return { data: settings };
};

export const updateSettings = async (data) => {
  Object.assign(settings, data);
  return { data: settings };
};