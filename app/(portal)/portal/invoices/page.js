'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Header } from '@/components/shared/Header';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function PortalInvoices() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['portal-invoices'],
    queryFn: () => api.get('/portal/invoices').then(r => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex items-center justify-end">
        <Link
          href="/portal/invoices/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        {(!invoices || invoices.length === 0) ? (
          <div className="p-6 text-center text-xs text-[var(--color-body-light)]">No invoices found</div>
        ) : (
          <>
            <div className="block md:hidden divide-y divide-[var(--color-border)]">
              {invoices.map((inv) => (
                <div key={inv._id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/portal/invoices/${inv._id}`} className="text-xs font-medium text-[var(--color-primary)] hover:underline">
                      {inv.invoice_number}
                    </Link>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      inv.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                      inv.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.payment_status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-body-light)] mb-2">{inv.customer_name || '-'} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-navy)]">₹{inv.total.toLocaleString()}</span>
                    <div className="text-right">
                      <span className="text-xs text-green-600">₹{inv.amount_paid?.toLocaleString() || 0} paid</span>
                      {inv.balance_due > 0 && (
                        <span className="text-xs text-orange-600 block">₹{inv.balance_due?.toLocaleString()} due</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                    <th className="text-left text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Invoice #</th>
                    <th className="text-left text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Date</th>
                    <th className="text-left text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Customer</th>
                    <th className="text-right text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Total</th>
                    <th className="text-right text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Paid</th>
                    <th className="text-right text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Balance</th>
                    <th className="text-center text-[10px] font-medium text-[var(--color-body-light)] uppercase tracking-wide px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/portal/invoices/${inv._id}`} className="text-xs font-medium text-[var(--color-primary)] hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--color-body-light)]">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--color-navy)]">
                        {inv.customer_name || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right font-medium text-[var(--color-navy)]">
                        ₹{inv.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right text-green-600">
                        ₹{inv.amount_paid?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right text-orange-600">
                        ₹{inv.balance_due?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          inv.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                          inv.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {inv.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}