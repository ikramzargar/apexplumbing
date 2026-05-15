'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Header } from '@/components/shared/Header';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, ArrowDownToLine, Package, Receipt, LogOut, Building2 } from 'lucide-react';
import { useState } from 'react';

const portalLinks = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/invoices', label: 'Invoices', icon: FileText },
  { href: '/portal/stock-requests', label: 'Stock Requests', icon: ArrowDownToLine },
  { href: '/portal/inventory', label: 'My Inventory', icon: Package },
  { href: '/portal/statements', label: 'Statement', icon: Receipt },
];

const pageTitles = {
  '/portal/dashboard': 'Dashboard',
  '/portal/invoices': 'Invoices',
  '/portal/stock-requests': 'Stock Requests',
  '/portal/inventory': 'My Inventory',
  '/portal/statements': 'Account Statement',
  '/portal/invoices/new': 'New Invoice',
  '/portal/stock-requests/new': 'New Stock Request',
};

export default function PortalLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, isDistributor } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isDistributor) {
      router.push('/dashboard');
    }
  }, [loading, isDistributor, router]);

  const currentTitle = pageTitles[pathname] || 'Portal';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={40} />
          <p className="text-sm text-[var(--color-body-light)]">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!isDistributor) return null;

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl shadow-md hover:shadow-lg transition-shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          {sidebarOpen ? (
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M2.25 4.5h13.5M2.25 9h13.5M2.25 13.5h13.5" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] h-screen bg-[var(--color-bg-subtle)] border-r border-[var(--color-border)] flex flex-col shadow-sm overflow-hidden",
          "transition-transform duration-200 ease-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <Link href="/portal/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/25 group-hover:scale-105 transition-transform">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--color-navy)] tracking-tight">APEX PLUMBING</h1>
              <p className="text-[10px] text-[var(--color-body-light)] uppercase tracking-widest font-medium">Distributor</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {portalLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white shadow-md shadow-[var(--color-primary)]/[0.2]"
                      : "text-[var(--color-body)] hover:text-[var(--color-navy)] hover:bg-[var(--color-bg)]"
                  )}
                >
                  <Icon size={18} className={isActive ? 'text-white' : ''} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-bg)] mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[var(--color-primary)]/20">
              <span className="text-sm font-semibold text-white">
                {(user?.business_name || user?.name || 'D').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-navy)] truncate">{user?.business_name || user?.name}</p>
              <p className="text-xs text-[var(--color-body-light)] capitalize">Distributor</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm text-[var(--color-body)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all duration-150"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-all duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 lg:ml-[260px]">
        <div className="p-4 md:p-6 space-y-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}