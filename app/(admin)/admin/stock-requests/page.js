'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStockRequests } from '@/lib/stockRequest.api';
import { getDistributors } from '@/lib/distributors.api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Eye, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  PARTIALLY_APPROVED: { label: 'Partial', variant: 'info' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

export default function AdminStockRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('all');
  const [distributorFilter, setDistributorFilter] = useState('');

  useEffect(() => {
    fetchDistributors();
    fetchRequests();
  }, [activeTab, statusFilter, distributorFilter]);

  const fetchDistributors = async () => {
    try {
      const response = await getDistributors();
      setDistributors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch distributors:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'pending') {
        params.status = 'PENDING';
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (distributorFilter) {
        params.distributorId = distributorFilter;
      }
      const response = await getAdminStockRequests(params);
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
    return items.reduce((sum, item) => sum + (item.requestedQuantity * item.unitPrice), 0);
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-[var(--color-navy)]">Stock Requests</h1>
        <p className="text-sm text-[var(--color-body-light)] mt-0.5">
          Review and manage distributor stock requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === 'pending'
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-body)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
            )}
          >
            Pending
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-[var(--color-warning)] text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === 'all'
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-body)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
            )}
          >
            All
          </button>
        </div>

        {/* Distributor Filter */}
        <div className="w-full sm:ml-auto sm:w-auto">
          <select
            value={distributorFilter}
            onChange={(e) => setDistributorFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option value="">All Distributors</option>
            {distributors.map((dist) => (
              <option key={dist._id} value={dist._id}>
                {dist.business_name}
              </option>
            ))}
          </select>
        </div>
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
          <h3 className="text-base font-medium text-[var(--color-navy)] mb-2">
            {activeTab === 'pending' ? 'No pending requests' : 'No requests found'}
          </h3>
          <p className="text-sm text-[var(--color-body-light)]">
            {activeTab === 'pending'
              ? 'All distributor stock requests have been reviewed'
              : 'No stock requests match your filters'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden divide-y divide-[var(--color-border)] bg-white rounded-xl border border-[var(--color-border)]">
            {requests.map((request) => (
              <div key={request._id} className={cn("p-4", request.status === 'PENDING' && "bg-[var(--color-warning)]/5")}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-navy)]">
                      {request.distributor?.business_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-[var(--color-body-light)]">
                      {formatDate(request.createdAt)} • {request.items.length} products
                    </p>
                  </div>
                  <StatusBadge status={request.status} config={statusConfig} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--color-navy)]">
                    {formatCurrency(calculateTotal(request.items))}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/stock-requests/${request._id}`)}
                    className="gap-1.5"
                  >
                    <Eye size={14} />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                    Distributor
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                    Products
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                    Est. Value
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
                  <tr
                    key={request._id}
                    className={cn(
                      "border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-subtle)]/50",
                      request.status === 'PENDING' && "bg-[var(--color-warning)]/5"
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-navy)]">
                          {request.distributor?.business_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-[var(--color-body-light)]">
                          {request.distributor?.owner_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[var(--color-body)]">
                        {formatDate(request.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
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
                      <StatusBadge status={request.status} config={statusConfig} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/stock-requests/${request._id}`)}
                        className="gap-1.5"
                      >
                        <Eye size={14} />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}