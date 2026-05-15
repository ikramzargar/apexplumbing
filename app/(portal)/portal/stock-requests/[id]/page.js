'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStockRequestById } from '@/lib/stockRequest.api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  PENDING: { label: 'Pending Review', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle },
  PARTIALLY_APPROVED: { label: 'Partially Approved', variant: 'info', icon: CheckCircle },
  REJECTED: { label: 'Rejected', variant: 'danger', icon: XCircle },
};

export default function StockRequestDetailPage() {
  const router = useParams();
  const requestId = router.id;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await getStockRequestById(requestId);
      setRequest(response.data);
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

  const getItemStatus = (item) => {
    if (item.approvedQuantity === null) return 'PENDING';
    if (item.approvedQuantity === 0) return 'REJECTED';
    if (item.approvedQuantity < item.requestedQuantity) return 'PARTIAL';
    return 'APPROVED';
  };

  const itemStatusConfig = {
    PENDING: { label: 'Pending', variant: 'warning' },
    APPROVED: { label: 'Approved', variant: 'success' },
    PARTIAL: { label: 'Partial', variant: 'info' },
    REJECTED: { label: 'Rejected', variant: 'danger' },
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
        <Button variant="outline" className="mt-4" onClick={() => router.push('/portal/stock-requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  const config = statusConfig[request.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const calculateTotal = () => {
    return request.items.reduce((sum, item) => {
      const qty = item.approvedQuantity ?? item.requestedQuantity;
      return sum + (qty * item.unitPrice);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/portal/stock-requests')}
          className="p-2 hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[var(--color-text-secondary)]">
              Request #{request._id.slice(-6).toUpperCase()}
            </h1>
            <StatusBadge status={request.status} config={statusConfig} />
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Submitted on {formatDate(request.createdAt)}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className={cn(
        "bg-[var(--color-surface)] rounded-xl border p-5 mb-6",
        request.status === 'APPROVED' || request.status === 'PARTIALLY_APPROVED'
          ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
          : request.status === 'REJECTED'
          ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
          : "border-[var(--color-border)]"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            request.status === 'APPROVED' || request.status === 'PARTIALLY_APPROVED'
              ? "bg-[var(--color-success)]/10"
              : request.status === 'REJECTED'
              ? "bg-[var(--color-danger)]/10"
              : "bg-[var(--color-warning)]/10"
          )}>
            <StatusIcon size={20} className={
              request.status === 'APPROVED' || request.status === 'PARTIALLY_APPROVED'
                ? "text-[var(--color-success)]"
                : request.status === 'REJECTED'
                ? "text-[var(--color-danger)]"
                : "text-[var(--color-warning)]"
            } />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-[var(--color-navy)]">{config.label}</h3>
            <p className="text-xs text-[var(--color-body-light)]">
              {request.status === 'PENDING'
                ? 'Admin is reviewing your request'
                : `Reviewed on ${formatDate(request.reviewedAt)}`}
            </p>
          </div>
        </div>

        {request.adminNote && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Admin Note:</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{request.adminNote}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Requested Products</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-surface-elevated)]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Product</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Requested</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Approved</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Price</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {request.items.map((item, index) => {
              const itemStatus = getItemStatus(item);
              return (
                <tr key={index} className="border-t border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{item.product?.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.product?.sku}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span className="text-sm text-[var(--color-text-muted)]">{item.requestedQuantity}</span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {item.approvedQuantity !== null ? (
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {item.approvedQuantity}
                      </span>
                    ) : (
                      <span className="text-sm text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <StatusBadge status={itemStatus} config={itemStatusConfig} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm text-[var(--color-text-muted)]">{formatCurrency(item.unitPrice)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {formatCurrency((item.approvedQuantity ?? item.requestedQuantity) * item.unitPrice)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <td colSpan={5} className="px-5 py-3 text-right">
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Total Value:</span>
              </td>
              <td className="px-5 py-3 text-right">
                <span className="text-base font-semibold text-[var(--color-text-secondary)]">
                  {formatCurrency(calculateTotal())}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {request.distributorNote && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Your Note</h3>
          <p className="text-sm text-[var(--color-text-muted)]">{request.distributorNote}</p>
        </div>
      )}
    </div>
  );
}