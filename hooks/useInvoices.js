'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInvoices,
  getInvoice,
  createRetailInvoice,
  createWholesaleInvoice,
  confirmInvoice,
  cancelInvoice,
  addPayment,
  getOutstanding
} from '@/lib/invoices.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetInvoices = (filters) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => getInvoices(filters),
  });
};

export const useGetInvoice = (id) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateRetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRetailInvoice,
    onSuccess: () => {
      showSuccess(toastMessages.invoiceCreated);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
    onError: showApiError,
  });
};

export const useCreateWholesale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWholesaleInvoice,
    onSuccess: () => {
      showSuccess(toastMessages.invoiceCreated);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: showApiError,
  });
};

export const useConfirmInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, allowOverride }) => confirmInvoice(id, allowOverride),
    onSuccess: () => {
      showSuccess(toastMessages.invoiceConfirmed);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: showApiError,
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
      showSuccess(toastMessages.invoiceCancelled);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
    onError: showApiError,
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => addPayment(id, data),
    onSuccess: () => {
      showSuccess(toastMessages.invoicePaymentAdded);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: showApiError,
  });
};

export const useGetOutstanding = () => {
  return useQuery({
    queryKey: ['outstanding-invoices'],
    queryFn: getOutstanding,
  });
};