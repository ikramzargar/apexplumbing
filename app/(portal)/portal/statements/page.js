'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/formatCurrency';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { TrendingUp, CreditCard, Receipt, FileText, CheckCircle, AlertCircle, ChevronDown, Package } from 'lucide-react';
import { getPortalStatement } from '@/lib/portal.api';
import { getPortalStockTransfers } from '@/lib/portal.api';
import api from '@/lib/axios';
import { useState } from 'react';

export default function PortalStatements() {
  const { data: statement, isLoading } = useQuery({
    queryKey: ['portal-statement'],
    queryFn: () => getPortalStatement().then(r => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const utilization = statement?.credit_limit > 0
    ? Math.round((statement.total_outstanding / statement.credit_limit) * 100)
    : 0;

  return (
    <>
      {/* Credit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl p-5 text-white shadow-lg shadow-[var(--color-primary)]/[0.2]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="opacity-80" />
            <span className="text-white/80 text-xs uppercase tracking-wide">Credit Limit</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(statement?.credit_limit || 0)}</p>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-green-100 mb-1">
              <span>Credit Utilization</span>
              <span>{utilization}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-center mb-3">
              <FileText size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="text-[10px] text-[var(--color-body-light)] uppercase mb-1">Total Billed</p>
            <p className="text-xl font-semibold text-[var(--color-navy)]">{formatCurrency(statement?.total_billed || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-center mb-3">
              <Receipt size={18} className="text-green-600" />
            </div>
            <p className="text-[10px] text-[var(--color-body-light)] uppercase mb-1">Total Paid</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(statement?.total_paid || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 col-span-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                statement?.total_outstanding > 0 ? 'bg-orange-50' : 'bg-green-50'
              }`}>
                {statement?.total_outstanding > 0 ? (
                  <AlertCircle size={20} className="text-orange-600" />
                ) : (
                  <CheckCircle size={20} className="text-green-600" />
                )}
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-body-light)] uppercase mb-0.5">Outstanding Balance</p>
                <p className={`text-2xl font-bold ${statement?.total_outstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(statement?.total_outstanding || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium text-[var(--color-navy)]">
            Recent Invoices ({statement?.invoices_count || 0} total)
          </h2>
        </div>
        {(!statement?.recent_invoices || statement.recent_invoices.length === 0) ? (
          <div className="p-6 text-center text-xs text-[var(--color-body-light)]">No invoices yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                  <th className="text-left text-[10px] font-medium text-[var(--color-body-light)] uppercase px-4 py-2.5">Invoice</th>
                  <th className="text-left text-[10px] font-medium text-[var(--color-body-light)] uppercase px-4 py-2.5">Date</th>
                  <th className="text-right text-[10px] font-medium text-[var(--color-body-light)] uppercase px-4 py-2.5">Total</th>
                  <th className="text-right text-[10px] font-medium text-[var(--color-body-light)] uppercase px-4 py-2.5">Paid</th>
                  <th className="text-right text-[10px] font-medium text-[var(--color-body-light)] uppercase px-4 py-2.5">Balance</th>
                  <th className="text-center text-[10px] font-medium text-[var(--color-body-light)] uppercase px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {statement.recent_invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-[var(--color-primary)]">{inv.invoice_number}</td>
                    <td className="px-4 py-2.5 text-xs text-[var(--color-body-light)]">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-medium text-[var(--color-navy)]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right text-green-600">
                      {formatCurrency(inv.amount_paid || 0)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right text-orange-600">
                      {formatCurrency(inv.balance_due || 0)}
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
        )}
      </div>

      {/* Stock Transfers */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium text-[var(--color-navy)]">Stock Transfers</h2>
        </div>
        <StockTransfers />
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium text-[var(--color-navy)]">Payment History</h2>
        </div>
        <PaymentHistory />
      </div>
    </>
  );
}

function PaymentHistory() {
  const [expandedId, setExpandedId] = useState(null);
  const { data: payments, isLoading } = useQuery({
    queryKey: ['portal-payments'],
    queryFn: () => api.get('/portal/payments').then(r => r.data.data),
  });

  if (isLoading) return <div className="p-6 text-center text-xs text-[var(--color-body-light)]">Loading...</div>;

  if (!payments || payments.length === 0) {
    return <div className="p-6 text-center text-xs text-[var(--color-body-light)]">No payments yet</div>;
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {payments.map((payment) => (
        <div key={payment._id}>
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-subtle)] transition-colors"
            onClick={() => setExpandedId(expandedId === payment._id ? null : payment._id)}
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                size={14}
                className={`text-[var(--color-body-light)] transition-transform ${expandedId === payment._id ? 'rotate-180' : ''}`}
              />
              <div>
                <p className="text-xs font-medium text-[var(--color-navy)]">
                  {payment.note || `${payment.method} Payment`}
                </p>
                <p className="text-[10px] text-[var(--color-body-light)]">
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-green-600">
                +{formatCurrency(payment.amount)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-body-light)]">
                {payment.method}
              </span>
            </div>
          </div>

          {expandedId === payment._id && payment.invoices && payment.invoices.length > 0 && (
            <div className="px-4 pb-4 bg-[var(--color-bg-subtle)]">
              <div className="text-[10px] uppercase tracking-wide text-[var(--color-body-light)] mb-2 pl-4">
                Applied to Invoices
              </div>
              <div className="space-y-2">
                {payment.invoices.map((inv, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-[var(--color-border)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--color-primary)]">{inv.invoice_number}</span>
                      <span className="text-xs font-semibold text-green-600">{formatCurrency(inv.amount)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-[var(--color-body-light)]">Invoice Total: </span>
                        <span className="text-[var(--color-navy)]">{formatCurrency(inv.total || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-body-light)]">Balance Before: </span>
                        <span className="text-[var(--color-navy)]">{formatCurrency(inv.balance_before || 0)}</span>
                      </div>
                    </div>
                    {inv.invoice?.items && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                        <div className="text-[10px] uppercase tracking-wide text-[var(--color-body-light)] mb-2">
                          Items Purchased
                        </div>
                        <div className="space-y-1">
                          {inv.invoice.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between text-[10px]">
                              <span className="text-[var(--color-navy)]">
                                {item.product_name || item.name || 'Product'}
                                {item.sku && <span className="text-[var(--color-body-light)] ml-1">({item.sku})</span>}
                              </span>
                              <span className="text-[var(--color-body-light)]">
                                x{item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StockTransfers() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['portal-stock-transfers'],
    queryFn: () => getPortalStockTransfers().then(r => r.data),
  });

  if (isLoading) return <div className="p-6 text-center text-xs text-[var(--color-body-light)]">Loading...</div>;

  if (!transfers || transfers.length === 0) {
    return <div className="p-6 text-center text-xs text-[var(--color-body-light)]">No stock transfers received</div>;
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {transfers.map((transfer) => (
        <div key={transfer._id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Package size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-navy)]">{transfer.invoice_number}</p>
                <p className="text-[10px] text-[var(--color-body-light)]">
                  {new Date(transfer.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--color-navy)]">{formatCurrency(transfer.total)}</p>
              <p className="text-[10px] text-[var(--color-body-light)]">
                {transfer.items?.length || 0} items
              </p>
            </div>
          </div>
          {transfer.items && transfer.items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <div className="space-y-2">
                {transfer.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--color-navy)]">{item.product_name}</span>
                    <span className="text-[var(--color-body-light)]">
                      x{item.quantity} @ {formatCurrency(item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}