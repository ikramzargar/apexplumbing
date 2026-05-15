'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, Download, Save } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InvoicePrint } from '@/modules/invoices/InvoicePrint';
import { showApiError, showSuccess, showError } from '@/utils/toast';
import '@/modules/invoices/InvoicePrint.css';

export default function PortalInvoiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['portal-invoice', id],
    queryFn: () => api.get(`/portal/invoices/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_phone: '',
    payment_method: 'Cash',
  });
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    if (data) {
      setEditForm({
        customer_name: data.distributor_name || data.customer_name || '',
        customer_phone: data.distributor_phone || data.customer_phone || '',
        payment_method: data.payment_method || 'Cash',
      });
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!editForm.customer_phone.trim()) {
      showError('Phone number is required');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/portal/invoices/${id}`, editForm);
      showSuccess('Invoice updated successfully');
      queryClient.invalidateQueries({ queryKey: ['portal-invoice', id] });
      setEditMode(false);
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#64748d]">Invoice not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/portal/invoices')}>
          <ArrowLeft size={14} className="mr-1" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/portal/invoices')}>
            <ArrowLeft size={14} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-[#061b31]">{data.invoice_number}</h1>
            <p className="text-xs text-[#64748d]">
              Created {new Date(data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {data.status === 'DRAFT' && editMode && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1 sm:flex-none">
                <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}

          {data.status === 'DRAFT' && !editMode && (
            <Button variant="outline" size="sm" onClick={handleEdit} className="flex-1 sm:flex-none">
              Edit Invoice
            </Button>
          )}

          {!editMode && (
            <>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="flex-1 sm:flex-none">
                <Printer size={14} className="mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const printContent = document.getElementById('invoice-print');
                const win = window.open('', '_blank');
                win.document.write('<html><head><title>Invoice</title>');
                win.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
                win.document.write('</head><body>');
                win.document.write(printContent.innerHTML);
                win.document.write('</body></html>');
                win.document.close();
                win.focus();
                setTimeout(() => { win.print(); }, 250);
              }} className="flex-1 sm:flex-none">
                <Download size={14} className="mr-1" /> Download
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2">
        <StatusBadge status={data.status} />
        <StatusBadge status={data.payment_status}
          variant={data.payment_status === 'PAID' ? 'success' : data.payment_status === 'PARTIAL' ? 'warning' : 'destructive'} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: formatCurrency(data.total), color: 'text-[#061b31]' },
          { label: 'Amount Paid', value: formatCurrency(data.amount_paid || 0), color: 'text-green-600' },
          { label: 'Balance Due', value: formatCurrency(data.balance_due || 0), color: 'text-orange-600' },
          { label: 'Payment', value: data.payment_method, color: 'text-[#64748d]' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-[#e8edf5] p-4">
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide mb-1">{item.label}</p>
            <p className={`text-base font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl border border-[#e8edf5] p-4">
        <h2 className="text-xs font-medium text-[#64748d] uppercase tracking-wide mb-3">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editMode ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone *</Label>
                <Input
                  value={editForm.customer_phone}
                  onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Payment Method</Label>
                <Select value={editForm.payment_method} onValueChange={(val) => setEditForm({ ...editForm, payment_method: val })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-[#94a3b8]">Name</p>
                <p className="text-sm text-[#061b31]">{data.distributor_name || data.customer_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">Phone</p>
                <p className="text-sm text-[#061b31]">{data.distributor_phone || data.customer_phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">Payment Method</p>
                <p className="text-sm text-[#061b31]">{data.payment_method || '-'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-[#e8edf5] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e8edf5]">
          <h2 className="text-xs font-medium text-[#64748d] uppercase tracking-wide">Items</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e8edf5]">
              <th className="text-left text-[10px] font-medium text-[#64748d] uppercase px-4 py-2">Product</th>
              <th className="text-right text-[10px] font-medium text-[#64748d] uppercase px-4 py-2">Qty</th>
              <th className="text-right text-[10px] font-medium text-[#64748d] uppercase px-4 py-2">Price</th>
              <th className="text-right text-[10px] font-medium text-[#64748d] uppercase px-4 py-2">Discount</th>
              <th className="text-right text-[10px] font-medium text-[#64748d] uppercase px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {(data.items || []).map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2.5">
                  <p className="text-xs font-medium text-[#061b31]">{item.product_name}</p>
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-[#64748d]">{item.quantity}</td>
                <td className="px-4 py-2.5 text-right text-xs text-[#64748d]">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-2.5 text-right text-xs text-[#64748d]">
                  {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                </td>
                <td className="px-4 py-2.5 text-right text-xs font-medium text-[#061b31]">
                  {formatCurrency(item.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Print Layout */}
      <div className="hidden print:block">
        <InvoicePrint invoice={data} />
      </div>
    </div>
  );
}