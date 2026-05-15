'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getSalesReport,
  getStockReport,
  getPlumberReport,
  getOutstandingReport,
  getDistrictReport,
  getStaffReport,
  getUserReport
} from '@/lib/reports.api';

export const useGetSalesReport = (filters) => {
  return useQuery({
    queryKey: ['sales-report', filters],
    queryFn: () => getSalesReport(filters),
  });
};

export const useGetStockReport = () => {
  return useQuery({
    queryKey: ['stock-report'],
    queryFn: getStockReport,
  });
};

export const useGetPlumberReport = (filters) => {
  return useQuery({
    queryKey: ['plumber-report', filters],
    queryFn: () => getPlumberReport(filters),
  });
};

export const useGetOutstandingReport = () => {
  return useQuery({
    queryKey: ['outstanding-report'],
    queryFn: getOutstandingReport,
  });
};

export const useGetDistrictReport = (filters) => {
  return useQuery({
    queryKey: ['district-report', filters],
    queryFn: () => getDistrictReport(filters),
  });
};

export const useGetStaffReport = (filters) => {
  return useQuery({
    queryKey: ['staff-report', filters],
    queryFn: () => getStaffReport(filters),
  });
};

export const useGetUserReport = (userId, filters) => {
  return useQuery({
    queryKey: ['user-report', userId, filters],
    queryFn: () => getUserReport(userId, filters),
    enabled: !!userId,
  });
};