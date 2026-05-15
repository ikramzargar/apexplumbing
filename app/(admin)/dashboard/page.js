'use client';

import { KPICards } from '@/modules/dashboard/KPICards';
import { SalesChart } from '@/modules/dashboard/SalesChart';
import { TopPlumbers } from '@/modules/dashboard/TopPlumbers';
import { LowStockAlert } from '@/modules/dashboard/LowStockAlert';
import { PendingPlumberApprovals } from '@/modules/dashboard/PendingPlumberApprovals';
import { useGetStats } from '@/hooks/useDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, error } = useGetStats();
  const { isStaff, isAdmin, isSuperAdmin } = useAuth();
  const stats = data?.data;

  // Debug: Show error state if API fails
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Failed to load dashboard</h3>
            <p className="text-sm text-[var(--color-body-light)]">{error.message || 'Please try again later'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size={40} />
        </div>
      ) : (
        <>
          <KPICards stats={stats} />
          {!isStaff && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <SalesChart />
              <TopPlumbers />
              <LowStockAlert />
            </div>
          )}
          {!isStaff && <PendingPlumberApprovals />}
        </>
      )}
    </div>
  );
}