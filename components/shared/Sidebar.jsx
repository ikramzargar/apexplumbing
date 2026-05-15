'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Activity,
  ArrowDownToLine
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plumbers', label: 'Plumbers', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/invoices', label: 'Invoices', icon: FileText },
];

const staffLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plumbers/new', label: 'Add Plumber', icon: Users },
  { href: '/staff/invoices', label: 'My Invoices', icon: FileText },
  { href: '/staff/invoices/new', label: 'New Invoice', icon: FileText },
  { href: '/stock', label: 'Main Stock', icon: Warehouse },
  { href: '/staff/inventory', label: 'My Inventory', icon: Package },
];

const adminPlusLinks = [
  { href: '/stock', label: 'Stock', icon: Warehouse },
  { href: '/distributors', label: 'Distributors', icon: Truck },
  // { href: '/admin/staff-inventory', label: 'Staff Inventory', icon: Package },
  { href: '/admin/stock-requests', label: 'Stock Requests', icon: ArrowDownToLine },
  { href: '/payouts', label: 'Payouts', icon: Wallet },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const superAdminLinks = [
  { href: '/users', label: 'User Management', icon: Users },
  { href: '/audit', label: 'Audit Log', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminOnlyLinks = [
  { href: '/users', label: 'User Management', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isSuperAdmin, isAdmin, isStaff } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  let links = [...adminLinks];
  if (isSuperAdmin) {
    links = [...links, ...adminPlusLinks, ...superAdminLinks];
  } else if (isAdmin) {
    links = [...links, ...adminPlusLinks, ...adminOnlyLinks];
  }
  if (isStaff && !isSuperAdmin && !isAdmin) {
    links = [...staffLinks];
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white border border-[var(--color-border)] rounded-xl shadow-md hover:shadow-lg transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={18} className="text-[var(--color-navy)]" /> : <Menu size={18} className="text-[var(--color-navy)]" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] h-screen bg-white border-r border-[var(--color-border)] flex flex-col shadow-sm overflow-hidden",
          "transition-transform duration-200 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/25 group-hover:scale-105 transition-transform">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--color-navy)] tracking-tight">HANSIF</h1>
              <p className="text-[10px] text-[var(--color-body-light)] uppercase tracking-widest font-medium">Group BMS</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white shadow-md shadow-[var(--color-primary)]/20"
                      : "text-[var(--color-body)] hover:text-[var(--color-navy)] hover:bg-[var(--color-bg-subtle)]"
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
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-bg-subtle)] mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[var(--color-primary)]/20">
              <span className="text-sm font-semibold text-white">
                {(user?.name || user?.business_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-navy)] truncate">{user?.name || user?.business_name}</p>
              <p className="text-xs text-[var(--color-body-light)] capitalize">{user?.role || 'User'}</p>
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
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-all duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}