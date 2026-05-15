import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActiveLocks,
  releaseLock,
  releaseAllLocks
} from '@/lib/stockLock.api';
import { showSuccess, showApiError } from '@/utils/toast';

export const useGetActiveLocks = () => {
  return useQuery({
    queryKey: ['stock-locks'],
    queryFn: getActiveLocks,
    refetchInterval: 10000,
  });
};

export const useReleaseLock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseLock,
    onSuccess: () => {
      showSuccess('Stock lock released');
      queryClient.invalidateQueries({ queryKey: ['stock-locks'] });
    },
    onError: showApiError,
  });
};

export const useReleaseAllLocks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseAllLocks,
    onSuccess: () => {
      showSuccess('All stock locks released');
      queryClient.invalidateQueries({ queryKey: ['stock-locks'] });
    },
    onError: showApiError,
  });
};