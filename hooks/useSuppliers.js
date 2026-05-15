'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '@/lib/suppliers.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useSuppliers = (filters = {}) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => getSuppliers(filters),
  });
};

export const useSupplier = (id) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      showSuccess(toastMessages.supplierCreated);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: showApiError,
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => {
      showSuccess(toastMessages.supplierUpdated);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: showApiError,
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      showSuccess(toastMessages.supplierDeleted);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: showApiError,
  });
};