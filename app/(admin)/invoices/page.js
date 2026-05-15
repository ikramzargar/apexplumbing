'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetInvoices } from '@/hooks/useInvoices';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { getMyInvoices } from '@/lib/invoices.api';
import { getStockTransferInvoices } from '@/lib/invoices.api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, RefreshCw, Search, X, Plus } from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const { isStaff } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    payment_status: 'all'
  });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('retail');

  const { data: allData, isLoading: allLoading } = useGetInvoices(filters);
  const { data: myData, isLoading: myLoading, refetch } = useQuery({
    queryKey: ['my-invoices', page, refreshKey],
    queryFn: () => getMyInvoices({ page, limit: 10 }),
    enabled: isStaff,
  });
  const { data: stockTransferData, isLoading: stockTransferLoading, refetch: refetchStockTransfers } = useQuery({
    queryKey: ['stock-transfers', filters],
    queryFn: () => getStockTransferInvoices(filters),
    enabled: !isStaff && activeTab === 'transfers',
  });

  const invoices = isStaff
    ? myData?.data?.invoices || []
    : activeTab === 'transfers'
    ? stockTransferData?.data?.invoices || []
    : allData?.data?.invoices || [];
  const pagination = myData?.data?.pagination;
  const totalRevenue = myData?.data?.totalRevenue || 0;
  const isLoading = isStaff ? myLoading : activeTab === 'transfers' ? stockTransferLoading : allLoading;

  const showAllInvoices = !isStaff;

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    refetch();
  };

  const clearFilters = () => {
    setFilters({ search: '', type: 'all', status: 'all', payment_status: 'all' });
  };

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.payment_status !== 'all';

  return (
    <div className="p-4 md:p-6 space-y-6">
        {/* Staff Revenue Summary */}
        {isStaff && (
          <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] border-0 shadow-lg shadow-[var(--color-primary)]/25 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wide font-medium mb-1">Total Revenue Generated</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <FileText size={28} className="text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:border-[var(--color-primary)] transition-all group shadow-sm"
            onClick={() => router.push('/invoices/retail/new')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-primary)]">Retail Invoice</h3>
                    <p className="text-sm text-[var(--color-body-light)]">For walk-in customers and retail sales</p>
                    <p className="text-xs text-[var(--color-primary)] mt-1">Uses retail prices</p>
                  </div>
                </div>
                <Plus size={20} className="text-[var(--color-body-light)] group-hover:text-[var(--color-primary)]" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-[var(--color-primary)] transition-all group shadow-sm"
            onClick={() => router.push('/invoices/distributor/new')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-primary)]">Distributor Invoice</h3>
                    <p className="text-sm text-[var(--color-body-light)]">For distributor and wholesale sales</p>
                    <p className="text-xs text-purple-600 mt-1">Uses wholesale prices</p>
                  </div>
                </div>
                <Plus size={20} className="text-[var(--color-body-light)] group-hover:text-[var(--color-primary)]" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-[var(--color-primary)] transition-all group shadow-sm"
            onClick={() => router.push('/invoices/distributor/new')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-primary)]">Stock Transfer</h3>
                    <p className="text-sm text-[var(--color-body-light)]">Auto-generated from stock requests</p>
                    <p className="text-xs text-green-600 mt-1">ST-XXXX sequence</p>
                  </div>
                </div>
                <Plus size={20} className="text-[var(--color-body-light)] group-hover:text-[var(--color-primary)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        {showAllInvoices && (
          <Card className="shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="retail">Retail</TabsTrigger>
                    <TabsTrigger value="wholesale">Wholesale</TabsTrigger>
                    <TabsTrigger value="transfers">Stock Transfers</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-body-light)]" />
                  <Input
                    placeholder="Search invoice #, customer..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 h-11"
                  />
                </div>

                <Select value={filters.type} onValueChange={(val) => setFilters({ ...filters, type: val })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Invoice Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="RETAIL">Retail</SelectItem>
                    <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.payment_status} onValueChange={(val) => setFilters({ ...filters, payment_status: val })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <span className="text-sm text-[var(--color-body-light)]">
                    {invoices.length} result{invoices.length !== 1 ? 's' : ''}
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[var(--color-body)] hover:text-[var(--color-danger)]">
                    <X size={14} className="mr-1.5" /> Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-primary-light)]">
                  <FileText size={18} className="text-[var(--color-primary)]" />
                </div>
                <span className="text-[var(--color-navy)]">{isStaff ? 'My Invoices' : 'All Invoices'}</span>
              </CardTitle>
              <div className="flex gap-2">
                {isStaff && (
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9">
                    <RefreshCw size={14} className="mr-2" /> Refresh
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-subtle)] flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-[var(--color-body-light)]" />
                </div>
                <p className="text-[var(--color-body-light)] mb-4">No invoices found</p>
                <Link href="/invoices/retail/new">
                  <Button className="shadow-sm shadow-[var(--color-primary)]/[0.2]">
                    <Plus size={16} className="mr-2" /> Create Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                      <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Invoice #</TableHead>
                      {showAllInvoices && activeTab !== 'transfers' && <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Type</TableHead>}
                      {activeTab === 'transfers' && <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Distributor</TableHead>}
                      {showAllInvoices && activeTab !== 'transfers' && <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Customer</TableHead>}
                      {showAllInvoices && activeTab !== 'transfers' && <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Created By</TableHead>}
                      <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Date</TableHead>
                      {activeTab === 'transfers' && <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-center">Items</TableHead>}
                      <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Total</TableHead>
                      {activeTab !== 'transfers' && <><TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Paid</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Balance</TableHead></>}
                      <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow
                        key={invoice._id}
                        className="cursor-pointer group hover:bg-[var(--color-primary-light)] transition-colors duration-150 border-b border-[var(--color-border)] last:border-0"
                        onClick={() => router.push(`/invoices/${invoice._id}`)}
                      >
                        <TableCell className="font-mono font-semibold text-[var(--color-navy)]">{invoice.invoice_number}</TableCell>
                        {showAllInvoices && activeTab !== 'transfers' && <TableCell><StatusBadge status={invoice.invoice_type} /></TableCell>}
                        {activeTab === 'transfers' && <TableCell className="text-[var(--color-body)]">{invoice.distributor?.business_name || invoice.distributor_name}</TableCell>}
                        {showAllInvoices && activeTab !== 'transfers' && (
                          <TableCell className="text-[var(--color-body)]">{invoice.distributor?.business_name || invoice.customer_name}</TableCell>
                        )}
                        {showAllInvoices && activeTab !== 'transfers' && (
                          <TableCell className="text-[var(--color-body)]">{invoice.created_by?.name || '-'}</TableCell>
                        )}
                        <TableCell className="text-sm text-[var(--color-body-light)]">{formatDate(invoice.createdAt)}</TableCell>
                        {activeTab === 'transfers' && <TableCell className="text-center text-[var(--color-body)]">{invoice.items?.length || 0}</TableCell>}
                        <TableCell className="text-right font-bold text-[var(--color-navy)]">{formatCurrency(invoice.total)}</TableCell>
                        {activeTab !== 'transfers' && <><TableCell className="text-right font-semibold text-[var(--color-success)]">{formatCurrency(invoice.amount_paid)}</TableCell>
                        <TableCell className={`text-right font-bold ${invoice.balance_due > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                          {formatCurrency(invoice.balance_due)}</TableCell></>}
                        <TableCell><StatusBadge status={invoice.payment_status || invoice.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-[var(--color-border)]">
                {invoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="p-4 cursor-pointer hover:bg-[var(--color-primary-light)]/30 transition-colors"
                    onClick={() => router.push(`/invoices/${invoice._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-semibold text-[var(--color-navy)]">{invoice.invoice_number}</p>
                        {showAllInvoices && <p className="text-xs text-[var(--color-body-light)] mt-0.5">{invoice.distributor?.business_name || invoice.customer_name}</p>}
                      </div>
                      <StatusBadge status={invoice.payment_status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--color-body-light)]">
                      <span>{formatDate(invoice.createdAt)}</span>
                      <div className="text-right">
                        <p className="font-bold text-[var(--color-navy)]">{formatCurrency(invoice.total)}</p>
                        <p className="text-[var(--color-success)]">Paid: {formatCurrency(invoice.amount_paid)}</p>
                      </div>
                    </div>
                    {showAllInvoices && (
                      <p className="text-xs text-[var(--color-body-light)] mt-2">By: {invoice.created_by?.name || '-'}</p>
                    )}
                  </div>
                ))}
              </div>
              {/* Pagination for staff */}
              {isStaff && pagination && pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-body-light)]">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex-1 sm:flex-none h-10"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= pagination.pages}
                      className="flex-1 sm:flex-none h-10"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
            )}
          </CardContent>
        </Card>
      </div>
  );
}