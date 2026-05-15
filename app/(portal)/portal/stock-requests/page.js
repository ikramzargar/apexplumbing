'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyStockRequests } from '@/lib/stockRequest.api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Plus, Eye, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/shared/Header';

const statusConfig = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  PARTIALLY_APPROVED: { label: 'Partial', variant: 'info' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

export default function StockRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyStockRequests(statusFilter);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
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
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const qty = item.approvedQuantity ?? item.requestedQuantity;
      return sum + (qty * item.unitPrice);
    }, 0);
  };

  return (
    <>
      <div className="flex items-center justify-end">
        <Link href="/portal/stock-requests/new">
          <Button className="gap-2">
            <Plus size={16} />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap",
              statusFilter === status
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-body)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
            )}
          >
            {status === 'all' ? 'All' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
          <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-[var(--color-body-light)]" />
          </div>
          <h3 className="text-base font-medium text-[var(--color-navy)] mb-2">No stock requests yet</h3>
          <p className="text-sm text-[var(--color-body-light)] mb-6">
            Submit a request to get stock from admin
          </p>
          <Link href="/portal/stock-requests/new">
            <Button className="gap-2">
              <Plus size={16} />
              New Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Request ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Products
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Total Value
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-subtle)]/50">
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-mono text-[var(--color-navy)]">
                      #{request._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[var(--color-body)]">
                      {formatDate(request.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[var(--color-body)]">
                      {request.items.length} product{request.items.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-medium text-[var(--color-navy)]">
                      {formatCurrency(calculateTotal(request.items))}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge
                      status={request.status}
                      config={statusConfig}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Link href={`/portal/stock-requests/${request._id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <Eye size={14} />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}