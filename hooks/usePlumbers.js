'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlumbers,
  getPlumber,
  createPlumber,
  updatePlumber,
  deletePlumber,
  verifyPlumber,
  getPlumberBonuses,
  getPlumberPayouts
} from '@/lib/plumbers.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetPlumbers = (filters) => {
  return useQuery({
    queryKey: ['plumbers', filters],
    queryFn: () => getPlumbers(filters),
  });
};

export const useGetPlumber = (id) => {
  return useQuery({
    queryKey: ['plumber', id],
    queryFn: () => getPlumber(id),
    enabled: !!id,
  });
};

export const useCreatePlumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlumber,
    onSuccess: () => {
      showSuccess(toastMessages.plumberCreated);
      queryClient.invalidateQueries({ queryKey: ['plumbers'] });
    },
    onError: showApiError,
  });
};

export const useUpdatePlumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updatePlumber(id, data),
    onSuccess: () => {
      showSuccess(toastMessages.plumberUpdated);
      queryClient.invalidateQueries({ queryKey: ['plumbers'] });
    },
    onError: showApiError,
  });
};

export const useVerifyPlumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => verifyPlumber(id, status),
    onSuccess: () => {
      showSuccess(toastMessages.plumberVerified);
      queryClient.invalidateQueries({ queryKey: ['plumbers'] });
    },
    onError: showApiError,
  });
};

export const useDeletePlumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlumber,
    onSuccess: () => {
      showSuccess(toastMessages.plumberDeleted);
      queryClient.invalidateQueries({ queryKey: ['plumbers'] });
    },
    onError: showApiError,
  });
};

export const useGetPlumberBonuses = (id) => {
  return useQuery({
    queryKey: ['plumber-bonuses', id],
    queryFn: () => getPlumberBonuses(id),
    enabled: !!id,
  });
};

export const useGetPlumberPayouts = (id) => {
  return useQuery({
    queryKey: ['plumber-payouts', id],
    queryFn: () => getPlumberPayouts(id),
    enabled: !!id,
  });
};