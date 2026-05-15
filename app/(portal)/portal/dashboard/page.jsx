'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FileText, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboard() {
  const { data: statement, isLoading: statementLoading } = useQuery({
    queryKey: ['portal-statement'],
    queryFn: () => api.get('/portal/statements').then(r => r.data.data),
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['portal-invoices'],
    queryFn: () => api.get('/portal/invoices').then(r => r.data.data),
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['portal-payments'],
    queryFn: () => api.get('/portal/payments').then(r => r.data.data),
  });

  const loading = statementLoading || invoicesLoading || paymentsLoading;
  if (loading) return <LoadingSpinner />;

  const stats = [
    {
      label: 'Credit Limit',
      value: `Rs.${(statement?.credit_limit || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]',
    },
    {
      label: 'Total Outstanding',
      value: `Rs.${(statement?.total_outstanding || 0).toLocaleString()}`,
      icon: AlertCircle,
      color: statement?.total_outstanding > 0 ? 'text-[var(--color-warning)] bg-[var(--color-warning-bg)]' : 'text-[var(--color-success)] bg-[var(--color-success-bg)]',
    },
    {
      label: 'Total Billed',
      value: `Rs.${(statement?.total_billed || 0).toLocaleString()}`,
      icon: FileText,
      color: 'text-[var(--color-primary)] bg-[var(--color-primary-muted)]',
    },
    {
      label: 'Total Paid',
      value: `Rs.${(statement?.total_paid || 0).toLocaleString()}`,
      icon: Receipt,
      color: 'text-[var(--color-success)] bg-[var(--color-success-bg)]',
    },
  ];

  const recentInvoices = (invoices || []).slice(0, 5);
  const recentPayments = (payments || []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-3 sm:p-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.color} flex items-center justify-center mb-2 sm:mb-3`}>
                <Icon size={14} className="sm:!size-[18px]" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-0.5 sm:mb-1">{stat.label}</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text-secondary)] whitespace-normal break-all leading-snug">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Recent Invoices</h2>
            <Link href="/portal/invoices" className="text-[11px] text-[var(--color-accent)] hover:underline font-medium shrink-0">
              View all
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">No invoices yet</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-muted)]">
              {recentInvoices.map((inv) => (
                <div key={inv._id} className="flex items-start justify-between px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[var(--color-surface-elevated)] transition-colors gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{inv.invoice_number}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] whitespace-nowrap">Rs.{inv.total.toLocaleString()}</p>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      inv.payment_status === 'PAID' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                      inv.payment_status === 'PARTIAL' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' :
                      'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                    }`}>
                      {inv.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Recent Payments</h2>
            <Link href="/portal/statements" className="text-[11px] text-[var(--color-accent)] hover:underline font-medium shrink-0">
              View all
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">No payment records yet</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-muted)]">
              {recentPayments.map((pay) => (
                <div key={pay._id} className="flex items-start justify-between px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[var(--color-surface-elevated)] transition-colors gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{pay.note || pay.method}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {new Date(pay.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-success)] shrink-0 whitespace-nowrap">
                    +Rs.{pay.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}