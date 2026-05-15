'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInvoice, updateInvoice, confirmInvoice, cancelInvoice, markAsPaid, markAsUnpaid, sendInvoiceWhatsApp } from '@/lib/invoices.api';
import { getPlumbers } from '@/lib/plumbers.api';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showApiError, showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Save, CheckCircle, XCircle, DollarSign, Printer, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { InvoicePrint } from '@/modules/invoices/InvoicePrint';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import '@/modules/invoices/InvoicePrint.css';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
  });

  const { data: plumbersData } = useQuery({
    queryKey: ['verified-plumbers'],
    queryFn: () => getPlumbers({ status: 'VERIFIED', limit: 100 }),
  });

  const invoice = data?.data;
  const plumbers = plumbersData?.data?.plumbers || [];

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    plumber_ref: '',
    payment_method: 'Cash',
    amount_paid: 0,
  });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({ phone: '', name: '' });
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const handleEdit = () => {
    if (invoice) {
      setForm({
        customer_name: invoice.customer_name || '',
        customer_phone: invoice.customer_phone || '',
        plumber_ref: invoice.plumber_ref?._id || '',
        payment_method: invoice.payment_method || 'Cash',
        amount_paid: invoice.amount_paid || 0,
      });
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!form.customer_phone.trim()) {
      showError('Customer phone is required');
      return;
    }

    setSaving(true);
    try {
      await updateInvoice(id, form);
      showSuccess('Invoice updated successfully');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      setEditMode(false);
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await confirmInvoice(id);
      showSuccess('Invoice confirmed successfully');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    } catch (err) {
      showApiError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    setActionLoading(true);
    try {
      await cancelInvoice(id);
      showSuccess('Invoice cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    } catch (err) {
      showApiError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setActionLoading(true);
    try {
      await markAsPaid(id);
      showSuccess('Invoice marked as paid');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    } catch (err) {
      showApiError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    setActionLoading(true);
    try {
      await markAsUnpaid(id);
      showSuccess('Invoice marked as unpaid');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
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
      await sendInvoiceWhatsApp(id, whatsappForm.phone, whatsappForm.name);
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
    <div className="p-4 md:p-6 space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/invoices">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {invoice.status === 'DRAFT' && editMode && (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1 sm:flex-none">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                  <Save size={16} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}

            {invoice.status === 'DRAFT' && !editMode && (
              <>
                <Button variant="outline" onClick={handleEdit} className="flex-1 sm:flex-none">
                  Edit Invoice
                </Button>
                <Button onClick={handleConfirm} disabled={actionLoading} className="flex-1 sm:flex-none bg-[var(--color-success)] hover:bg-[var(--color-success)]">
                  <CheckCircle size={16} className="mr-1" /> Confirm
                </Button>
              </>
            )}

            {invoice.status === 'CONFIRMED' && invoice.invoice_type === 'STOCK_TRANSFER' && (
              <div className="flex flex-wrap gap-2">
                {invoice.payment_status !== 'PAID' && (
                  <Button onClick={handleMarkAsPaid} disabled={actionLoading} className="bg-[var(--color-success)] hover:bg-[var(--color-success)]">
                    <DollarSign size={16} className="mr-1" /> Mark Paid
                  </Button>
                )}
                {invoice.payment_status === 'PAID' && (
                  <Button variant="outline" onClick={handleMarkAsUnpaid} disabled={actionLoading}>
                    <XCircle size={16} className="mr-1" /> Unpaid
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer size={16} className="mr-1" /> Print
                </Button>
                <Button variant="outline" onClick={() => {
                  const { downloadInvoicePDF } = require('@/utils/generatePDF');
                  downloadInvoicePDF(invoice);
                }}>
                  <Download size={16} className="mr-1" /> Download
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
                  <XCircle size={16} className="mr-1" /> Cancel
                </Button>
              </div>
            )}

            {invoice.status === 'CONFIRMED' && invoice.invoice_type !== 'STOCK_TRANSFER' && (
              <div className="flex flex-wrap gap-2">
                {invoice.payment_status !== 'PAID' && (
                  <Button onClick={handleMarkAsPaid} disabled={actionLoading} className="flex-1 sm:flex-none bg-[var(--color-success)] hover:bg-[var(--color-success)]">
                    <DollarSign size={16} className="mr-1" /> Mark Paid
                  </Button>
                )}
                {invoice.payment_status === 'PAID' && (
                  <Button variant="outline" onClick={handleMarkAsUnpaid} disabled={actionLoading} className="flex-1 sm:flex-none">
                    <XCircle size={16} className="mr-1" /> Unpaid
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none">
                  <Printer size={16} className="mr-1" /> Print
                </Button>
                <Button variant="outline" onClick={() => {
                  const { downloadInvoicePDF } = require('@/utils/generatePDF');
                  downloadInvoicePDF(invoice);
                }} className="flex-1 sm:flex-none">
                  <Download size={16} className="mr-1" /> Download
                </Button>
                {invoice.customer_phone && (
                  <Button variant="outline" onClick={() => {
                    setWhatsappForm({ phone: invoice.customer_phone, name: invoice.customer_name || '' });
                    setWhatsappOpen(true);
                  }} className="flex-1 sm:flex-none bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white border-0">
                    <MessageSquare size={16} className="mr-1" /> Send WhatsApp
                  </Button>
                )}
                <Button variant="destructive" onClick={handleCancel} disabled={actionLoading} className="flex-1 sm:flex-none">
                  <XCircle size={16} className="mr-1" /> Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{invoice.invoice_number}</CardTitle>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {invoice.invoice_type === 'RETAIL' ? 'Retail' : 'Distributor'} Invoice • Created {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                </p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={invoice.status} />
                <StatusBadge status={invoice.payment_status} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer / Distributor Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide pb-2 border-b border-[var(--color-border)]">
                  {invoice.invoice_type === 'WHOLESALE' ? 'Distributor Details' : 'Customer Details'}
                </h3>

                {editMode ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>{invoice.invoice_type === 'WHOLESALE' ? 'Distributor Name' : 'Customer Name'}</Label>
                      <Input
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        placeholder={invoice.invoice_type === 'WHOLESALE' ? 'Distributor name' : 'Customer name'}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone *</Label>
                      <Input
                        value={form.customer_phone}
                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Referral Plumber</Label>
                      <Select value={form.plumber_ref} onValueChange={(val) => setForm({ ...form, plumber_ref: val })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select plumber" />
                        </SelectTrigger>
                        <SelectContent>
                          {plumbers.map((plumber) => (
                            <SelectItem key={plumber._id} value={plumber._id}>
                              {plumber.full_name} - {plumber.referral_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Payment Method</Label>
                      <Select value={form.payment_method} onValueChange={(val) => setForm({ ...form, payment_method: val })}>
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
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">{invoice.invoice_type === 'WHOLESALE' ? 'Distributor' : 'Customer'}</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">
                        {invoice.distributor_name || invoice.customer_name || invoice.distributor?.business_name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Phone</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">
                        {invoice.distributor_phone || invoice.customer_phone || invoice.distributor?.phone || '-'}
                      </span>
                    </div>
                    {(invoice.distributor_address || invoice.distributor?.address) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-muted)]">Address</span>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {invoice.distributor_address || invoice.distributor?.address || '-'}
                        </span>
                      </div>
                    )}
                    {invoice.plumber_ref && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-muted)]">Referral Plumber</span>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {invoice.plumber_ref.full_name} ({invoice.plumber_ref.referral_code})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Payment Method</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">{invoice.payment_method}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Summary */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide pb-2 border-b border-[var(--color-border)]">
                  Payment Summary
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Subtotal</span>
                  <span className="font-medium text-[var(--color-text-secondary)]">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Tax</span>
                  <span className="font-medium text-[var(--color-text-secondary)]">{formatCurrency(invoice.tax || 0)}</span>
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
            <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
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
                      <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] text-right">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Created By */}
        {invoice.created_by && (
          <div className="text-xs text-[var(--color-text-muted)] text-center">
            Created by {invoice.created_by.name}
          </div>
        )}
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
              The invoice will be sent as a formatted message via WhatsApp to the number above.
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