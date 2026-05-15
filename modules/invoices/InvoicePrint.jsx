'use client';

import { formatCurrency } from '@/utils/formatCurrency';

export function InvoicePrint({ invoice }) {
  if (!invoice) return null;

  const items = invoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount || 0)), 0);
  const tax = invoice.tax || 0;
  const total = invoice.total || subtotal + tax;

  return (
    <div className="bg-[var(--color-surface)] p-8 max-w-[800px] mx-auto" id="invoice-print">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[var(--color-accent)] pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-secondary)]">APEX PLUMBING</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Kashmir Sanitary PVC</p>
          <p className="text-xs text-[var(--color-text-muted)]">Water Tanks, Pipes & Fittings</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-[var(--color-text-secondary)]">
            {invoice.invoice_type === 'WHOLESALE' ? 'DISTRIBUTOR INVOICE' : 'RETAIL INVOICE'}
          </h2>
          <p className="text-sm font-semibold text-[var(--color-text)]">{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Bill To</h3>
          {invoice.invoice_type === 'WHOLESALE' && invoice.distributor ? (
            <div>
              <p className="font-semibold text-[var(--color-text-secondary)]">{invoice.distributor.business_name}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{invoice.distributor.owner_name}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{invoice.distributor.phone}</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-[var(--color-text-secondary)]">{invoice.customer_name || 'Walk-in Customer'}</p>
              {invoice.customer_phone && <p className="text-sm text-[var(--color-text-muted)]">{invoice.customer_phone}</p>}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <div className="flex justify-end gap-8">
              <span className="text-xs text-[var(--color-text-muted)]">Invoice Date:</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-xs text-[var(--color-text-muted)]">Payment Status:</span>
              <span className={`text-sm font-medium ${
                invoice.payment_status === 'PAID' ? 'text-[var(--color-success)]' :
                invoice.payment_status === 'PARTIAL' ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
              }`}>{invoice.payment_status}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-xs text-[var(--color-text-muted)]">Payment Method:</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{invoice.payment_method || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plumber Reference */}
      {invoice.plumber_ref && (
        <div className="mb-6 p-3 bg-[var(--color-bg)] rounded-lg">
          <span className="text-xs text-[var(--color-text-muted)]">Referral Plumber: </span>
          <span className="text-sm font-medium text-[var(--color-text)]">{invoice.plumber_ref.full_name}</span>
          {invoice.plumber_ref.district && (
            <span className="text-xs text-[var(--color-text-muted)]"> ({invoice.plumber_ref.district})</span>
          )}
        </div>
      )}

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left text-xs font-semibold text-[var(--color-text-muted)] py-2">#</th>
            <th className="text-left text-xs font-semibold text-[var(--color-text-muted)] py-2">Product</th>
            <th className="text-right text-xs font-semibold text-[var(--color-text-muted)] py-2">Qty</th>
            <th className="text-right text-xs font-semibold text-[var(--color-text-muted)] py-2">Rate</th>
            <th className="text-right text-xs font-semibold text-[var(--color-text-muted)] py-2">Discount</th>
            <th className="text-right text-xs font-semibold text-[var(--color-text-muted)] py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[var(--color-border-muted)]">
              <td className="py-2 text-sm text-[var(--color-text-muted)]">{index + 1}</td>
              <td className="py-2 text-sm">
                <p className="font-medium text-[var(--color-text-secondary)]">{item.product_name || item.product?.name}</p>
                {item.sku && <span className="text-xs text-[var(--color-text-muted)] ml-2">({item.sku})</span>}
              </td>
              <td className="py-2 text-sm text-right text-[var(--color-text)]">{item.quantity}</td>
              <td className="py-2 text-sm text-right text-[var(--color-text)]">{formatCurrency(item.unit_price)}</td>
              <td className="py-2 text-sm text-right text-[var(--color-text-muted)]">{item.discount ? formatCurrency(item.discount) : '-'}</td>
              <td className="py-2 text-sm text-right font-medium text-[var(--color-text)]">
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
            <span className="text-sm text-[var(--color-text-muted)]">Subtotal</span>
            <span className="text-sm font-medium text-[var(--color-text)]">{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-sm text-[var(--color-text-muted)]">Tax</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b-2 border-[var(--color-accent)]">
            <span className="text-base font-semibold text-[var(--color-text-secondary)]">Total</span>
            <span className="text-lg font-bold text-[var(--color-text-secondary)]">{formatCurrency(total)}</span>
          </div>
          {invoice.amount_paid > 0 && (
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-sm text-[var(--color-text-muted)]">Amount Paid</span>
              <span className="text-sm font-medium text-[var(--color-success)]">{formatCurrency(invoice.amount_paid)}</span>
            </div>
          )}
          {invoice.balance_due > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Balance Due</span>
              <span className="text-sm font-bold text-[var(--color-warning)]">{formatCurrency(invoice.balance_due)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <div className="grid grid-cols-2 gap-8 text-xs text-[var(--color-text-muted)]">
          <div>
            <p className="font-medium mb-1 text-[var(--color-text)]">Terms & Conditions</p>
            <p>1. Goods once sold will not be taken back.</p>
            <p>2. Payment should be made within the stipulated time.</p>
            <p>3. Disputes subject to Kashmir jurisdiction.</p>
          </div>
          <div className="text-right">
            <p className="font-medium mb-4 text-[var(--color-text)]">For APEX PLUMBING</p>
            <p className="mb-8 text-[var(--color-text-muted)]">Authorised Signatory</p>
            <p>Created by: {invoice.created_by?.name || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}