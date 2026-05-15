'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetInvoices } from '@/hooks/useInvoices';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function PendingApprovals() {
  const { data, isLoading, error } = useGetInvoices({ status: 'DRAFT', type: 'WHOLESALE' });
  const invoices = data?.data?.invoices || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 border-b border-[var(--color-border)]">
        <CardTitle className="text-sm font-semibold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Clock size={18} className="text-amber-500" />
          </div>
          <span className="text-[var(--color-navy)]">Pending Approvals</span>
          {invoices.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{invoices.length}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-[var(--color-success)]">
            <CheckCircle size={18} className="mr-2" />
            <span className="text-sm font-semibold">All caught up!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.slice(0, 5).map((invoice) => (
              <Link
                key={invoice._id}
                href={`/invoices/${invoice._id}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-bg-subtle)] transition-all duration-150 border border-transparent hover:border-[var(--color-border)] group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-primary)] transition-colors">{invoice.invoice_number}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <p className="text-xs text-[var(--color-body-light)]">
                    {invoice.distributor?.business_name || 'N/A'}
                  </p>
                  <p className="text-xs text-[var(--color-body-light)] mt-0.5">
                    {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-base font-bold text-[var(--color-navy)]">{formatCurrency(invoice.total)}</p>
                </div>
              </Link>
            ))}
            {invoices.length > 5 && (
              <Link href="/invoices?status=DRAFT&type=WHOLESALE" className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline pt-2">
                View all {invoices.length} pending →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}