'use client';

import { formatCurrency } from '@/utils/formatCurrency';

export function InvoicePrint({ invoice }) {
  if (!invoice) return null;

  const items = invoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount || 0)), 0);
  const tax = invoice.tax || 0;
  const total = invoice.total || subtotal + tax;

  return (
    <div className="bg-[var(--color-bg-subtle)] p-8 max-w-[800px] mx-auto" id="invoice-print">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#0ea5e9] pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">APEX PLUMBING</h1>
          <p className="text-sm text-[#94a3b8]">Kashmir Sanitary PVC</p>
          <p className="text-xs text-[#94a3b8]">Water Tanks, Pipes & Fittings</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-[#f1f5f9]">
            {invoice.invoice_type === 'WHOLESALE' ? 'DISTRIBUTOR INVOICE' : 'RETAIL INVOICE'}
          </h2>
          <p className="text-sm font-semibold">{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-xs font-semibold text-[#94a3b8] uppercase mb-2">Bill To</h3>
          {invoice.invoice_type === 'WHOLESALE' && invoice.distributor ? (
            <div>
              <p className="font-semibold text-[#f1f5f9]">{invoice.distributor.business_name}</p>
              <p className="text-sm text-[#94a3b8]">{invoice.distributor.owner_name}</p>
              <p className="text-sm text-[#94a3b8]">{invoice.distributor.phone}</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-[#f1f5f9]">{invoice.customer_name || 'Walk-in Customer'}</p>
              {invoice.customer_phone && <p className="text-sm text-[#94a3b8]">{invoice.customer_phone}</p>}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <div className="flex justify-end gap-8">
              <span className="text-xs text-[#64748d]">Invoice Date:</span>
              <span className="text-sm font-medium">{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-xs text-[#94a3b8]">Payment Status:</span>
              <span className={`text-sm font-medium ${
                invoice.payment_status === 'PAID' ? 'text-green-600' :
                invoice.payment_status === 'PARTIAL' ? 'text-orange-600' : 'text-red-600'
              }`}>{invoice.payment_status}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-xs text-[#94a3b8]">Payment Method:</span>
              <span className="text-sm font-medium">{invoice.payment_method || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plumber Reference */}
      {invoice.plumber_ref && (
        <div className="mb-6 p-3 bg-[var(--color-bg)] rounded-lg">
          <span className="text-xs text-[#94a3b8]">Referral Plumber: </span>
          <span className="text-sm font-medium">{invoice.plumber_ref.full_name}</span>
          {invoice.plumber_ref.district && (
            <span className="text-xs text-[#94a3b8]"> ({invoice.plumber_ref.district})</span>
          )}
        </div>
      )}

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left text-xs font-semibold text-[#94a3b8] py-2">#</th>
            <th className="text-left text-xs font-semibold text-[#94a3b8] py-2">Product</th>
            <th className="text-right text-xs font-semibold text-[#94a3b8] py-2">Qty</th>
            <th className="text-right text-xs font-semibold text-[#94a3b8] py-2">Rate</th>
            <th className="text-right text-xs font-semibold text-[#94a3b8] py-2">Discount</th>
            <th className="text-right text-xs font-semibold text-[#94a3b8] py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[#f1f5f9]">
              <td className="py-2 text-sm text-[#64748d]">{index + 1}</td>
              <td className="py-2 text-sm">
                <p className="font-medium text-[#f1f5f9]">{item.product_name || item.product?.name}</p>
                {item.sku && <span className="text-xs text-[#64748d] ml-2">({item.sku})</span>}
              </td>
              <td className="py-2 text-sm text-right">{item.quantity}</td>
              <td className="py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
              <td className="py-2 text-sm text-right">{item.discount ? formatCurrency(item.discount) : '-'}</td>
              <td className="py-2 text-sm text-right font-medium">
                {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-sm text-[#94a3b8]">Subtotal</span>
            <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-sm text-[#94a3b8]">Tax</span>
              <span className="text-sm font-medium">{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b-2 border-[#061b31]">
            <span className="text-base font-semibold text-[#f1f5f9]">Total</span>
            <span className="text-lg font-bold text-[#f1f5f9]">{formatCurrency(total)}</span>
          </div>
          {invoice.amount_paid > 0 && (
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-sm text-[#94a3b8]">Amount Paid</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(invoice.amount_paid)}</span>
            </div>
          )}
          {invoice.balance_due > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-[#f1f5f9]">Balance Due</span>
              <span className="text-sm font-bold text-orange-600">{formatCurrency(invoice.balance_due)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <div className="grid grid-cols-2 gap-8 text-xs text-[#94a3b8]">
          <div>
            <p className="font-medium mb-1">Terms & Conditions</p>
            <p>1. Goods once sold will not be taken back.</p>
            <p>2. Payment should be made within the stipulated time.</p>
            <p>3. Disputes subject to Kashmir jurisdiction.</p>
          </div>
          <div className="text-right">
            <p className="font-medium mb-4">For APEX PLUMBING</p>
            <p className="mb-8">Authorised Signatory</p>
            <p>Created by: {invoice.created_by?.name || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}