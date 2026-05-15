'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getStaffInvoices } from '@/lib/staffInventory.api';
import { Plus, FileText, Calendar, Phone, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function StaffInvoicesPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => getStaffInvoices({ limit: 50 })
  });

  const invoices = data?.data?.invoices || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 px-4 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-secondary)]">My Invoices</h1>
          <p className="text-xs text-[var(--color-text-muted)]">View and manage your invoices</p>
        </div>
        <Button onClick={() => router.push('/staff/invoices/new')} className="w-full sm:w-auto">
          <Plus size={14} className="mr-1" /> New
        </Button>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-[var(--color-text-muted)] mb-3" />
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">No invoices yet</h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">Create your first invoice from your inventory</p>
              <Button onClick={() => router.push('/staff/invoices/new')}>
                <Plus size={14} className="mr-1" /> Create Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {invoices.map((invoice) => (
            <Link key={invoice._id} href={`/staff/invoices/${invoice._id}`}>
              <Card className="hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-[var(--color-text-muted)]">{invoice.invoice_number}</span>
                        <StatusBadge status={invoice.status === 'CONFIRMED' ? 'CONFIRMED' : invoice.status} />
                        <StatusBadge status={invoice.payment_status} variant={invoice.payment_status === 'PAID' ? 'success' : invoice.payment_status === 'PARTIAL' ? 'warning' : 'destructive'} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{invoice.customer_name || 'Walk-in Customer'}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Phone size={12} /> {invoice.customer_phone}</span>
                          <span className="flex items-center gap-1"><CreditCard size={12} /> {invoice.payment_method}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(invoice.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[var(--color-primary)]">{formatCurrency(invoice.total)}</p>
                      {invoice.balance_due > 0 && (
                        <p className="text-xs text-[var(--color-danger)]">Due: {formatCurrency(invoice.balance_due)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}