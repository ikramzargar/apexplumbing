'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDistributors,
  getDistributor,
  createDistributor,
  updateDistributor
} from '@/lib/distributors.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetDistributors = () => {
  return useQuery({
    queryKey: ['distributors'],
    queryFn: getDistributors,
  });
};

export const useGetDistributor = (id) => {
  return useQuery({
    queryKey: ['distributor', id],
    queryFn: () => getDistributor(id),
    enabled: !!id,
  });
};

export const useCreateDistributor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDistributor,
    onSuccess: () => {
      showSuccess('Distributor created successfully');
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    },
    onError: showApiError,
  });
};

export const useUpdateDistributor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateDistributor(id, data),
    onSuccess: () => {
      showSuccess('Distributor updated successfully');
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    },
    onError: showApiError,
  });
};