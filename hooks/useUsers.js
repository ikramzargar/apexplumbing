'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUser, createUser, updateUser, deactivateUser, reactivateUser } from '@/lib/users.api';
import { showSuccess, showApiError, toastMessages } from '@/utils/toast';

export const useGetUsers = (params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const result = await getUsers(params);
      console.log('getUsers result:', result);
      return result;
    },
    onError: (error) => {
      showApiError(error);
    },
  });
};

export const useGetUser = (id) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      showSuccess(toastMessages.userCreated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: showApiError,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      showSuccess(toastMessages.userUpdated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: showApiError,
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      showSuccess(toastMessages.userDeactivated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: showApiError,
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => {
      showSuccess(toastMessages.userReactivated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: showApiError,
  });
};