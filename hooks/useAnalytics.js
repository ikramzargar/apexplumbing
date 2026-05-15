'use client';

import { useQuery } from '@tanstack/react-query';
import { getMaterials, getStatements, getSupplierStatements, getAnalytics, getAuditLogs } from '@/lib/analytics.api';

export const useGetMaterials = (filters = {}) => {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => getMaterials(filters),
  });
};

export const useGetMaterial = (id) => {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => {
      const { getMaterial } = require('@/lib/analytics.api');
      return getMaterial(id);
    },
    enabled: !!id,
  });
};

export const useGetStatements = (filters = {}) => {
  return useQuery({
    queryKey: ['statements', filters],
    queryFn: () => getStatements(filters),
  });
};

export const useGetSupplierStatements = (supplierId) => {
  return useQuery({
    queryKey: ['supplier-statements', supplierId],
    queryFn: () => getSupplierStatements(supplierId),
  });
};

export const useGetAnalytics = (type) => {
  return useQuery({
    queryKey: ['analytics', type],
    queryFn: () => getAnalytics(type),
  });
};

export const useGetAuditLogs = (filters = {}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
  });
};