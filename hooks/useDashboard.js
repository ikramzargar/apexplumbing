'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getSalesChart,
  getTopPlumbers
} from '@/lib/dashboard.api';

export const useGetStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });
};

export const useGetSalesChart = (dateFrom, dateTo, groupBy) => {
  return useQuery({
    queryKey: ['sales-chart', dateFrom, dateTo, groupBy],
    queryFn: () => getSalesChart(dateFrom, dateTo, groupBy),
  });
};

export const useGetTopPlumbers = (limit) => {
  return useQuery({
    queryKey: ['top-plumbers', limit],
    queryFn: () => getTopPlumbers(limit),
  });
};