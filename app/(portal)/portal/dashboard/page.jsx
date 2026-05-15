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
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total Outstanding',
      value: `Rs.${(statement?.total_outstanding || 0).toLocaleString()}`,
      icon: AlertCircle,
      color: statement?.total_outstanding > 0 ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50',
    },
    {
      label: 'Total Billed',
      value: `Rs.${(statement?.total_billed || 0).toLocaleString()}`,
      icon: FileText,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Total Paid',
      value: `Rs.${(statement?.total_paid || 0).toLocaleString()}`,
      icon: Receipt,
      color: 'text-green-600 bg-green-50',
    },
  ];

  const recentInvoices = (invoices || []).slice(0, 5);
  const recentPayments = (payments || []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-[var(--color-border)] p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-[10px] text-[var(--color-body-light)] uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-lg font-semibold text-[var(--color-navy)]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-navy)]">Recent Invoices</h2>
            <Link href="/portal/invoices" className="text-[11px] text-[var(--color-primary)] hover:underline font-medium">
              View all
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-body-light)]">No invoices yet</div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {recentInvoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-navy)]">{inv.invoice_number}</p>
                    <p className="text-[10px] text-[var(--color-body-light)]">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-[var(--color-navy)]">Rs.{inv.total.toLocaleString()}</p>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      inv.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                      inv.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
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
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-navy)]">Recent Payments</h2>
            <Link href="/portal/statements" className="text-[11px] text-[var(--color-primary)] hover:underline font-medium">
              View all
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-body-light)]">No payment records yet</div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {recentPayments.map((pay) => (
                <div key={pay._id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-navy)]">{pay.note || pay.method}</p>
                    <p className="text-[10px] text-[var(--color-body-light)]">
                      {new Date(pay.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-green-600">
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