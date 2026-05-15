'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getStaffInvoice, cancelStaffInvoice, sendStaffInvoiceWhatsApp, updateStaffInvoice } from '@/lib/staffInventory.api';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { showApiError, showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Printer, Download, XCircle, Package, MessageSquare, Save } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvoicePrint } from '@/modules/invoices/InvoicePrint';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import '@/modules/invoices/InvoicePrint.css';

export default function StaffInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ['staff-invoice', id],
    queryFn: () => getStaffInvoice(id),
  });

  const invoice = data?.data;
  const [actionLoading, setActionLoading] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({ phone: '', name: '' });
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_phone: '',
    payment_method: 'Cash',
    amount_paid: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    if (invoice) {
      setEditForm({
        customer_name: invoice.customer_name || '',
        customer_phone: invoice.customer_phone || '',
        payment_method: invoice.payment_method || 'Cash',
        amount_paid: invoice.amount_paid || 0,
      });
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!editForm.customer_phone.trim()) {
      showError('Customer phone is required');
      return;
    }
    setSaving(true);
    try {
      await updateStaffInvoice(id, editForm);
      showSuccess('Invoice updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-invoice', id] });
      setEditMode(false);
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    setActionLoading(true);
    try {
      await cancelStaffInvoice(id);
      showSuccess('Invoice cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-invoice', id] });
    } catch (err) {
      showApiError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!whatsappForm.phone.trim()) {
      showError('Phone number is required');
      return;
    }
    setSendingWhatsapp(true);
    try {
      await sendStaffInvoiceWhatsApp(id, whatsappForm.phone, whatsappForm.name);
      showSuccess('Invoice sent via WhatsApp!');
      setWhatsappOpen(false);
      setWhatsappForm({ phone: '', name: '' });
    } catch (err) {
      showApiError(err);
    } finally {
      setSendingWhatsapp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Invoice not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/staff/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft size={14} />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-secondary)]">{invoice.invoice_number}</h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Created {format(new Date(invoice.createdAt), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {invoice.status === 'DRAFT' && editMode && (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                  <Save size={16} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}

            {invoice.status === 'DRAFT' && !editMode && (
              <Button variant="outline" onClick={handleEdit} className="flex-1 sm:flex-none">
                Edit Invoice
              </Button>
            )}

            {!editMode && (
              <>
                <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none">
                  <Printer size={16} className="mr-1" /> Print
                </Button>
                <Button variant="outline" onClick={() => {
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
                  <Download size={16} className="mr-1" /> Download
                </Button>
                {invoice.customer_phone && (
                  <Button variant="outline" onClick={() => {
                    setWhatsappForm({ phone: invoice.customer_phone || '', name: invoice.customer_name || '' });
                    setWhatsappOpen(true);
                  }} className="flex-1 sm:flex-none bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white border-0">
                    <MessageSquare size={16} className="mr-1" /> Send WhatsApp
                  </Button>
                )}
                {invoice.status !== 'CANCELLED' && (
                  <Button variant="destructive" onClick={handleCancel} disabled={actionLoading} className="flex-1 sm:flex-none">
                    <XCircle size={16} className="mr-1" /> Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          <StatusBadge
            status={invoice.payment_status}
            variant={invoice.payment_status === 'PAID' ? 'success' : invoice.payment_status === 'PARTIAL' ? 'warning' : 'destructive'}
          />
        </div>

        {/* Customer & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide pb-2 border-b border-[var(--color-border)]">
                  Customer Details
                </h3>
                {editMode ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>Customer Name</Label>
                      <Input
                        value={editForm.customer_name}
                        onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                        placeholder="Customer name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone *</Label>
                      <Input
                        value={editForm.customer_phone}
                        onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Payment Method</Label>
                      <Select value={editForm.payment_method} onValueChange={(val) => setEditForm({ ...editForm, payment_method: val })}>
                        <SelectTrigger className="h-11">
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
                    <div className="space-y-1.5">
                      <Label>Amount Paid</Label>
                      <Input
                        type="number"
                        value={editForm.amount_paid}
                        onChange={(e) => setEditForm({ ...editForm, amount_paid: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Name</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">{invoice.customer_name || 'Walk-in Customer'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Phone</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">{invoice.customer_phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Payment Method</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">{invoice.payment_method}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide pb-2 border-b border-[var(--color-border)]">
                  Payment Summary
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Subtotal</span>
                  <span className="font-medium text-[var(--color-text-secondary)]">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[var(--color-border)] pt-2">
                  <span className="text-[var(--color-text-muted)]">Total</span>
                  <span className="font-semibold text-[var(--color-text-secondary)]">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Amount Paid</span>
                  <span className="font-medium text-[var(--color-success)]">{formatCurrency(invoice.amount_paid)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[var(--color-border)] pt-2">
                  <span className="text-[var(--color-text-muted)]">Balance Due</span>
                  <span className="font-bold text-lg text-[var(--color-danger)]">{formatCurrency(invoice.balance_due)}</span>
                </div>
                {editMode && (
                  <div className="flex justify-between text-sm border-t border-[var(--color-border)] pt-2">
                    <span className="text-[var(--color-text-muted)]">New Balance</span>
                    <span className="font-bold text-lg text-[var(--color-danger)]">
                      {formatCurrency(invoice.total - (editForm.amount_paid || 0))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.items?.length === 0 ? (
              <div className="text-center py-8">
                <Package size={40} className="mx-auto text-[var(--color-text-muted)] mb-3" />
                <p className="text-[var(--color-text-muted)]">No items in this invoice</p>
              </div>
            ) : (
              <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-surface-elevated)]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Product</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Price</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Discount</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {invoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                          {item.product_name}
                          {item.sku && <span className="text-xs text-[var(--color-text-muted)] ml-2">({item.sku})</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-right">{formatCurrency(item.discount || 0)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] text-right">
                          {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Layout - Hidden on screen, visible when printing */}
      <div className="hidden print:block">
        <InvoicePrint invoice={invoice} />
      </div>

      {/* Send Invoice via WhatsApp Dialog */}
      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice via WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={whatsappForm.name}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, name: e.target.value })}
                placeholder="Customer name (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                value={whatsappForm.phone}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, phone: e.target.value })}
                placeholder="91XXXXXXXXXX"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The invoice will be sent as a formatted message via WhatsApp.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={sendingWhatsapp}
              className="bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white border-0"
            >
              {sendingWhatsapp ? 'Sending...' : 'Send via WhatsApp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}