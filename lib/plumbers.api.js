import api from './axios';

export const getPlumbers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  console.log('getPlumbers API call - filters:', filters, 'params:', params);
  const response = await api.get(`/plumbers${params ? `?${params}` : ''}`);
  console.log('getPlumbers response:', response.data);
  return response.data;
};

export const getPlumber = async (id) => {
  const response = await api.get(`/plumbers/${id}`);
  return response.data;
};

export const createPlumber = async (data) => {
  const payload = {
    full_name: data.full_name,
    phone: data.phone,
    alt_phone: data.alt_phone || undefined,
    aadhaar_number: data.aadhaar_number,
    address: data.address,
    district: data.district,
    bank_account: data.bank_account || undefined,
    ifsc: data.ifsc || undefined,
    bank_name: data.bank_name || undefined,
    notes: data.notes || undefined,
  };

  // Convert files to base64 if present
  if (data.photo && data.photo instanceof File) {
    payload.photo = await fileToBase64(data.photo);
  }
  if (data.aadhaar_front && data.aadhaar_front instanceof File) {
    payload.aadhaar_front = await fileToBase64(data.aadhaar_front);
  }
  if (data.aadhaar_back && data.aadhaar_back instanceof File) {
    payload.aadhaar_back = await fileToBase64(data.aadhaar_back);
  }

  const response = await api.post('/plumbers', payload);
  return response.data;
};

export const updatePlumber = async (id, data) => {
  const payload = {
    full_name: data.full_name,
    phone: data.phone,
    alt_phone: data.alt_phone || undefined,
    aadhaar_number: data.aadhaar_number,
    address: data.address,
    district: data.district,
    bank_account: data.bank_account || undefined,
    ifsc: data.ifsc || undefined,
    bank_name: data.bank_name || undefined,
    notes: data.notes || undefined,
  };

  if (data.photo && data.photo instanceof File) {
    payload.photo = await fileToBase64(data.photo);
  }
  if (data.aadhaar_front && data.aadhaar_front instanceof File) {
    payload.aadhaar_front = await fileToBase64(data.aadhaar_front);
  }
  if (data.aadhaar_back && data.aadhaar_back instanceof File) {
    payload.aadhaar_back = await fileToBase64(data.aadhaar_back);
  }

  const response = await api.put(`/plumbers/${id}`, payload);
  return response.data;
};

export const verifyPlumber = async (id, status) => {
  const response = await api.patch(`/plumbers/${id}/verify`, { status });
  return response.data;
};

export const deletePlumber = async (id) => {
  const response = await api.delete(`/plumbers/${id}`);
  return response.data;
};

export const getPlumberBonuses = async (id) => {
  const response = await api.get(`/plumbers/${id}/bonuses`);
  return response.data;
};

export const getPlumberPayouts = async (id) => {
  const response = await api.get(`/plumbers/${id}/payouts`);
  return response.data;
};

export const getPlumberByReferralCode = async (code) => {
  const response = await api.get(`/plumbers/referral/${code}`);
  return response.data;
};

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}