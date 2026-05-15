// Toast utility functions - works on client side

/**
 * Dispatch a toast event to the Toaster component
 */
const dispatchToast = ({ title, description, variant = 'default' }) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toast', { detail: { title, description, variant } }));
  }
};

/**
 * Show a success toast
 */
export const showSuccess = (description) => {
  dispatchToast({ title: 'Success', description, variant: 'success' });
};

/**
 * Show an error toast with human-readable message
 */
export const showError = (description) => {
  dispatchToast({ title: 'Error', description, variant: 'destructive' });
};

/**
 * Show a warning toast
 */
export const showWarning = (description) => {
  dispatchToast({ title: 'Warning', description, variant: 'default' });
};

/**
 * Show an info toast
 */
export const showInfo = (description) => {
  dispatchToast({ title: 'Info', description, variant: 'default' });
};

/**
 * Convert API error to human readable message and show toast
 */
export const showApiError = (error) => {
  const description =
    error?.displayMessage ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Please try again.';
  showError(description);
};

// Specific error messages by action
export const toastMessages = {
  // Users
  userCreated: 'User created successfully',
  userUpdated: 'User updated successfully',
  userDeleted: 'User deleted successfully',
  userDeactivated: 'User deactivated successfully',
  userReactivated: 'User reactivated successfully',
  userLoadError: 'Failed to load users',

  // Plumbers
  plumberCreated: 'Plumber registered successfully',
  plumberUpdated: 'Plumber updated successfully',
  plumberDeleted: 'Plumber deleted successfully',
  plumberVerified: 'Plumber verified successfully',
  plumberLoadError: 'Failed to load plumbers',
  plumberDuplicate: 'Duplicate plumber detected',

  // Invoices
  invoiceCreated: 'Invoice created successfully',
  invoiceConfirmed: 'Invoice confirmed successfully',
  invoiceCancelled: 'Invoice cancelled successfully',
  invoiceLoadError: 'Failed to load invoices',
  invoiceCreateError: 'Failed to create invoice',
  invoicePaymentAdded: 'Payment added successfully',

  // Stock
  stockAdded: 'Stock added successfully',
  stockUpdated: 'Stock updated successfully',
  stockOut: 'Stock removed successfully',
  stockLoadError: 'Failed to load stock',
  stockLow: 'Stock is running low for some products',
  stockNotEnough: 'Not enough stock available',

  // Payouts
  payoutCreated: 'Payout created successfully',
  payoutApproved: 'Payout approved successfully',
  payoutPaid: 'Payout marked as paid',
  payoutCancelled: 'Payout cancelled successfully',

  // Returns
  returnCreated: 'Return created successfully',
  returnApproved: 'Return approved',
  returnRejected: 'Return rejected',

  // Suppliers
  supplierCreated: 'Supplier created successfully',
  supplierUpdated: 'Supplier updated successfully',
  supplierDeleted: 'Supplier deleted successfully',

  // Products
  productCreated: 'Product created successfully',
  productUpdated: 'Product updated successfully',
  productDeactivated: 'Product deactivated successfully',

  // Auth
  loginFailed: 'Invalid email or password',
  sessionExpired: 'Your session has expired. Please login again.',
  accessDenied: 'You do not have permission to do this',

  // General
  genericError: 'Something went wrong. Please try again.',
  serverError: 'Server error. Please try again or contact support.',
  notFound: 'The requested resource was not found.',
};