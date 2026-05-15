'use client';

import { useGetInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/utils/formatCurrency';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const statusStyles = {
  PAID: 'text-emerald-600 bg-emerald-50',
  PENDING: 'text-amber-600 bg-amber-50',
  CREDIT: 'text-blue-600 bg-blue-50',
  CANCELLED: 'text-red-500 bg-red-50',
};

function RecentInvoicesSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-5 w-40 bg-gray-100 rounded mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function RecentInvoices() {
  const { data, isLoading } = useGetInvoices({ limit: 8 });
  const invoices = data?.data?.invoices || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] font-semibold text-gray-900">Recent Invoices</h3>
        <Link
          href="/invoices"
          className="text-[13px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[100px_1fr_80px_100px_80px_90px] gap-4 px-4 pb-3 border-b border-gray-100">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Invoice</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Customer</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Type</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium text-right">Amount</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium text-center">Status</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Date</span>
          </div>

          <div className="divide-y divide-gray-50">
            {invoices.slice(0, 8).map((invoice) => (
              <div
                key={invoice._id}
                className="grid grid-cols-[100px_1fr_80px_100px_80px_90px] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
              >
                <Link
                  href={`/invoices/${invoice._id}`}
                  className="font-mono text-[13px] text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {invoice.invoice_number}
                </Link>
                <span className="text-[14px] text-gray-900 truncate">
                  {invoice.distributor?.business_name || invoice.customer?.name || 'N/A'}
                </span>
                <span className="text-[12px] text-gray-500 capitalize">
                  {invoice.type?.toLowerCase() || 'retail'}
                </span>
                <span className="font-mono text-[14px] font-medium text-gray-900 text-right">
                  {formatCurrency(invoice.total)}
                </span>
                <div className="flex justify-center">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      statusStyles[invoice.status] || statusStyles.PENDING
                    }`}
                  >
                    {invoice.status?.toLowerCase()}
                  </span>
                </div>
                <span className="text-[12px] text-gray-400">
                  {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}