'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAdminStockRequestById, approveStockRequest, rejectStockRequest } from '@/lib/stockRequest.api';
import { getProducts } from '@/lib/products.api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Package, FileText, Eye, Download, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';
import { downloadInvoicePDF } from '@/utils/generatePDF';
import { sendInvoiceWhatsApp } from '@/lib/invoices.api';

const statusConfig = {
  PENDING: { label: 'Pending Review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  PARTIALLY_APPROVED: { label: 'Partially Approved', variant: 'info' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

export default function AdminStockRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id;
  const [request, setRequest] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [approvedItems, setApprovedItems] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalResult, setApprovalResult] = useState(null);

  useEffect(() => {
    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestRes, productsRes] = await Promise.all([
        getAdminStockRequestById(requestId),
        getProducts()
      ]);
      setRequest(requestRes.data);
      setProducts(productsRes.data.products || []);

      const initialApproved = {};
      requestRes.data.items.forEach((item) => {
        initialApproved[item._id] = item.requestedQuantity;
      });
      setApprovedItems(initialApproved);
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAvailableStock = (productId) => {
    const product = products.find((p) => p._id === productId);
    return product?.current_stock || 0;
  };

  const updateApprovedQty = (itemId, qty) => {
    setApprovedItems({ ...approvedItems, [itemId]: qty });
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const items = request.items.map((item) => ({
        stockRequestItemId: item._id,
        approvedQuantity: approvedItems[item._id] || 0,
      }));
      const result = await approveStockRequest(requestId, items, adminNote);
      setApprovalResult(result.data || result);
      if (!result.data?.generatedInvoiceId) {
        navigate('/admin/stock-requests?success=approved');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      setSubmitting(true);
      await rejectStockRequest(requestId, rejectReason);
      navigate('/admin/stock-requests?success=rejected');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-body)]">Request not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/stock-requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  const navigate = (path) => {
    if (typeof router?.push === 'function') {
      router.push(path);
    } else {
      window.location.href = path;
    }
  };

  const isPending = request.status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            navigate('/admin/stock-requests')}}
          className="p-2 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--color-body)]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[var(--color-navy)]">
              Review Stock Request
            </h1>
            <StatusBadge status={request.status} config={statusConfig} />
          </div>
          <p className="text-sm text-[var(--color-body-light)] mt-0.5">
            Request from {request.distributor?.business_name}
          </p>
        </div>
      </div>

      {/* Distributor Info Card */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-navy)] mb-2">Distributor Details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-[var(--color-body-light)]">Business Name</p>
                <p className="font-medium text-[var(--color-navy)]">{request.distributor?.business_name}</p>
              </div>
              <div>
                <p className="text-[var(--color-body-light)]">Owner</p>
                <p className="font-medium text-[var(--color-navy)]">{request.distributor?.owner_name}</p>
              </div>
              <div>
                <p className="text-[var(--color-body-light)]">Phone</p>
                <p className="font-medium text-[var(--color-navy)]">{request.distributor?.phone}</p>
              </div>
              <div>
                <p className="text-[var(--color-body-light)]">Submitted</p>
                <p className="font-medium text-[var(--color-navy)]">{formatDate(request.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-body-light)] uppercase tracking-wide mb-1">Total Value</p>
            <p className="text-2xl font-bold text-[var(--color-navy)]">
              {formatCurrency(request.items.reduce((sum, item) => sum + (item.requestedQuantity * item.unitPrice), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-navy)]">Requested Products</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase">Product</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase">Available</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase">Requested</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase">Approve</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase">Price</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {request.items.map((item) => {
              const available = getAvailableStock(item.product?._id);
              const isOverRequested = item.requestedQuantity > available;
              const approvedQty = approvedItems[item._id] || 0;

              return (
                <tr key={item._id} className="border-t border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-navy)]">{item.product?.name}</p>
                      <p className="text-xs text-[var(--color-body-light)]">{item.product?.sku}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span className={cn(
                      "text-sm font-medium",
                      isOverRequested ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"
                    )}>
                      {available}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span className="text-sm text-[var(--color-body)]">{item.requestedQuantity}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    {isPending ? (
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          max={available}
                          value={approvedQty}
                          onChange={(e) => updateApprovedQty(item._id, parseInt(e.target.value) || 0)}
                          className={cn(
                            "w-20 px-2 py-1.5 text-sm text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/[0.2]",
                            isOverRequested ? "border-[var(--color-warning)]" : "border-[var(--color-border)]"
                          )}
                        />
                        {isOverRequested && (
                          <p className="text-xs text-[var(--color-warning)] mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Max {available}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className={cn(
                        "text-sm font-semibold",
                        item.approvedQuantity === item.requestedQuantity ? "text-[var(--color-success)]" :
                        item.approvedQuantity === 0 ? "text-[var(--color-danger)]" : "text-[var(--color-info)]"
                      )}>
                        {item.approvedQuantity ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm text-[var(--color-body)]">{formatCurrency(item.unitPrice)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-medium text-[var(--color-navy)]">
                      {formatCurrency(approvedQty * item.unitPrice)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Admin Note */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-6">
        <label className="text-sm font-semibold text-[var(--color-navy)] mb-2 block">
          Note to Distributor (optional)
        </label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Add any notes about this request..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/[0.2] resize-none"
          disabled={!isPending}
        />
      </div>

      {/* Distributor Note */}
      {request.distributorNote && (
        <div className="bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)] p-5 mb-6">
          <p className="text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide mb-2">Distributor Note</p>
          <p className="text-sm text-[var(--color-navy)]">{request.distributorNote}</p>
        </div>
      )}

      {/* Generated Invoice Section */}
      {approvalResult?.generatedInvoiceId && (
        <div className="bg-[var(--color-success)]/5 border border-[var(--color-success)]/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
              <CheckCircle size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-navy)]">Request Approved</p>
              <p className="text-sm text-[var(--color-body)]">
                Stock transferred to {request.distributor?.business_name}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white rounded-lg p-4">
            <div>
              <p className="text-xs text-[var(--color-body-light)] uppercase tracking-wide">Invoice Generated</p>
              <p className="text-lg font-bold text-[var(--color-navy)]">
                {approvalResult.generatedInvoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-body-light)]">Total Value</p>
              <p className="text-lg font-bold text-[var(--color-navy)]">
                {formatCurrency(approvalResult.generatedInvoiceTotal || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/invoices/${approvalResult.generatedInvoiceId}`)}
              className="gap-2"
            >
              <Eye size={14} />
              View Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const inv = { ...approvalResult, invoice_number: approvalResult.generatedInvoiceNumber, invoice_type: 'STOCK_TRANSFER' };
                downloadInvoicePDF(inv);
              }}
              className="gap-2"
            >
              <Download size={14} />
              Download PDF
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const phone = request.distributor?.phone;
                const name = request.distributor?.business_name;
                if (phone) {
                  sendInvoiceWhatsApp(approvalResult.generatedInvoiceId, phone, name)
                    .then(() => alert('Invoice sent via WhatsApp'))
                    .catch(() => alert('Failed to send invoice'));
                }
              }}
              className="gap-2 bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white border-0"
            >
              <MessageSquare size={14} />
              Share WhatsApp
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/stock-requests?success=approved')}
              className="ml-auto"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Generated Invoice Section (for already approved requests) */}
      {!approvalResult && request.invoice && (
        <div className="bg-[var(--color-success)]/5 border border-[var(--color-success)]/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
              <FileText size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-navy)]">Invoice Generated</p>
              <p className="text-sm text-[var(--color-body)]">
                Invoice <span className="font-medium">{request.generatedInvoiceNumber || request.invoice?.invoice_number}</span> was automatically created
              </p>
            </div>
            <a
              href={`/admin/invoices/${typeof request.invoice === 'object' ? request.invoice._id : request.invoice}`}
              className="ml-auto px-4 py-2 text-sm font-medium bg-[var(--color-success)] text-white rounded-lg hover:bg-[var(--color-success)]/90 transition-colors"
            >
              View Invoice
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending ? (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="gap-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30"
            onClick={() => setShowRejectModal(true)}
          >
            <XCircle size={16} />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <LoadingSpinner size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            Approve Request
          </Button>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-sm text-[var(--color-body)]">
            This request has been {request.status === 'REJECTED' ? 'rejected' : 'reviewed'}.
            {request.reviewedBy && ` Reviewed by ${request.reviewedBy?.name || 'Admin'}`}
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Reject Stock Request</h3>
            <p className="text-sm text-[var(--color-body-light)] mb-4">
              Please provide a reason for rejecting this request. The distributor will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/[0.2] resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting}
              >
                {submitting ? <LoadingSpinner size={16} /> : 'Reject Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}