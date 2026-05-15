'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentStock,
  stockIn,
  manualStockOut,
  getMovements,
  getLowStock
} from '@/lib/stock.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetCurrentStock = (filters = {}) => {
  return useQuery({
    queryKey: ['stock', filters],
    queryFn: () => {
      const params = new URLSearchParams(filters).toString();
      return getCurrentStock(params ? `?${params}` : '');
    },
  });
};

export const useStockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stockIn,
    onSuccess: () => {
      showSuccess(toastMessages.stockAdded);
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
    onError: showApiError,
  });
};

export const useManualOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: manualStockOut,
    onSuccess: () => {
      showSuccess(toastMessages.stockOut);
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
    onError: showApiError,
  });
};

export const useGetMovements = (filters) => {
  return useQuery({
    queryKey: ['stock-movements', filters],
    queryFn: () => getMovements(filters),
  });
};

export const useGetLowStock = () => {
  return useQuery({
    queryKey: ['low-stock'],
    queryFn: getLowStock,
  });
};