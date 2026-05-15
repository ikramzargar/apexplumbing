'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/shared/Sidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Toaster } from '@/components/ui/toaster';

const superAdminRoutes = ['/settings'];
const adminRoutes = ['/users', '/payouts', '/stock', '/distributors'];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isSuperAdmin, isAdmin, isDistributor } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && isDistributor) {
      router.push('/portal/dashboard');
      return;
    }

    if (!loading && user) {
      if (!isSuperAdmin && superAdminRoutes.some(r => pathname.startsWith(r))) {
        router.push('/dashboard');
        return;
      }
      if (!isSuperAdmin && !isAdmin && adminRoutes.some(r => pathname.startsWith(r))) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, isSuperAdmin, isAdmin, isDistributor, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={40} />
          <p className="text-sm text-[#64748d]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || isDistributor) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pb-20 md:p-6 lg:ml-[260px]">
        {children}
      </main>
      <Toaster />
    </div>
  );
}