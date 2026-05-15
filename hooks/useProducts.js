'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deactivateProduct
} from '@/lib/products.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  });
};

export const useGetProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      showSuccess(toastMessages.productCreated);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: showApiError,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      showSuccess(toastMessages.productUpdated);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: showApiError,
  });
};

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      showSuccess(toastMessages.productDeactivated);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: showApiError,
  });
};