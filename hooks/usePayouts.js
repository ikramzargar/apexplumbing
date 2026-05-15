'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayouts,
  getPendingPayouts,
  getPendingBalances,
  getPayout,
  createPayout,
  approvePayout,
  markPayoutPaid,
  cancelPayout
} from '@/lib/payouts.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetPayouts = (filters) => {
  return useQuery({
    queryKey: ['payouts', filters],
    queryFn: () => getPayouts(filters),
  });
};

export const useGetPendingPayouts = () => {
  return useQuery({
    queryKey: ['pending-payouts'],
    queryFn: getPendingPayouts,
  });
};

export const useGetPendingBalances = () => {
  return useQuery({
    queryKey: ['pending-balances'],
    queryFn: getPendingBalances,
    staleTime: 60000,
  });
};

export const useGetPayout = (id) => {
  return useQuery({
    queryKey: ['payout', id],
    queryFn: () => getPayout(id),
    enabled: !!id,
  });
};

export const useCreatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayout,
    onSuccess: () => {
      showSuccess(toastMessages.payoutCreated);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-balances'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
    },
    onError: showApiError,
  });
};

export const useApprovePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvePayout,
    onSuccess: () => {
      showSuccess(toastMessages.payoutApproved);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
    },
    onError: showApiError,
  });
};

export const useMarkPayoutPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPayoutPaid,
    onSuccess: () => {
      showSuccess(toastMessages.payoutPaid);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['plumbers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-balances'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
    },
    onError: showApiError,
  });
};

export const useCancelPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPayout,
    onSuccess: () => {
      showSuccess(toastMessages.payoutCancelled);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-balances'] });
    },
    onError: showApiError,
  });
};