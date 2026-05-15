'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/shared/Sidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Toaster } from '@/components/ui/toaster';

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isStaff } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && user && !isStaff) {
      router.push('/dashboard');
    }
  }, [user, loading, isStaff, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-elevated)]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={40} />
          <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-surface-elevated)]">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pb-20 md:p-6 lg:ml-[260px]">
        {children}
      </main>
      <Toaster />
    </div>
  );
}