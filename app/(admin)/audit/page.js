'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, getAuditSummary } from '@/lib/audit.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Activity,
  Package,
  FileText,
  Users,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

const ACTION_LABELS = {
  CREATE: { label: 'Created', color: 'bg-green-100 text-green-700' },
  UPDATE: { label: 'Updated', color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Deleted', color: 'bg-red-100 text-red-700' },
  STOCK_IN: { label: 'Stock In', color: 'bg-emerald-100 text-emerald-700' },
  STOCK_OUT: { label: 'Stock Out', color: 'bg-orange-100 text-orange-700' },
  STOCK_ADJUSTMENT: { label: 'Adjustment', color: 'bg-purple-100 text-purple-700' },
  INVOICE_CREATED: { label: 'Invoice Created', color: 'bg-indigo-100 text-indigo-700' },
  INVOICE_CONFIRMED: { label: 'Invoice Confirmed', color: 'bg-green-100 text-green-700' },
  INVOICE_CANCELLED: { label: 'Invoice Cancelled', color: 'bg-red-100 text-red-700' },
  RETURN_CREATED: { label: 'Return Created', color: 'bg-yellow-100 text-yellow-700' },
  RETURN_PROCESSED: { label: 'Return Processed', color: 'bg-teal-100 text-teal-700' },
  USER_CREATED: { label: 'User Created', color: 'bg-blue-100 text-blue-700' },
  USER_UPDATED: { label: 'User Updated', color: 'bg-blue-100 text-blue-700' },
  USER_DEACTIVATED: { label: 'User Deactivated', color: 'bg-gray-100 text-gray-700' },
  PRODUCT_CREATED: { label: 'Product Created', color: 'bg-purple-100 text-purple-700' },
  PRODUCT_UPDATED: { label: 'Product Updated', color: 'bg-purple-100 text-purple-700' },
  PRODUCT_DEACTIVATED: { label: 'Product Deactivated', color: 'bg-gray-100 text-gray-700' },
  TRANSFER_TO_STAFF: { label: 'Transfer to Staff', color: 'bg-cyan-100 text-cyan-700' },
  TRANSFER_FROM_STAFF: { label: 'Transfer from Staff', color: 'bg-cyan-100 text-cyan-700' },
  BONUS_CREATED: { label: 'Bonus Created', color: 'bg-amber-100 text-amber-700' },
  BONUS_PAID: { label: 'Bonus Paid', color: 'bg-amber-100 text-amber-700' },
  PAYMENT_ADDED: { label: 'Payment Added', color: 'bg-green-100 text-green-700' },
  PAYOUT_PROCESSED: { label: 'Payout Processed', color: 'bg-amber-100 text-amber-700' }
};

const ENTITY_TYPES = ['Invoice', 'Product', 'Stock', 'User', 'StaffInventory', 'Return', 'Payout', 'Bonus', 'Distributor', 'Plumber'];

export default function AuditPage() {
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    entity_type: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 50
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters)
  });

  const { data: summaryData } = useQuery({
    queryKey: ['audit-summary', filters.dateFrom, filters.dateTo],
    queryFn: () => getAuditSummary(filters.dateFrom, filters.dateTo),
    enabled: true
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionInfo = (action) => {
    return ACTION_LABELS[action] || { label: action, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all system activities and changes"
      />

      {/* Summary Cards */}
      {summaryData?.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Activity size={20} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Actions</p>
                  <p className="text-xl font-bold">
                    {summaryData.data.actionStats?.reduce((sum, s) => sum + s.count, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invoices</p>
                  <p className="text-xl font-bold">
                    {summaryData.data.actionStats?.find(s => s._id?.includes('INVOICE'))?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Package size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock Movements</p>
                  <p className="text-xl font-bold">
                    {summaryData.data.actionStats?.find(s => s._id?.includes('STOCK'))?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="text-xl font-bold">
                    {summaryData.data.actionStats?.find(s => s._id?.includes('USER'))?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, search: '', action: '', entity_type: '', dateFrom: '', dateTo: '', page: 1 })}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Invoice #, name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Entity Type</Label>
              <Select
                value={filters.entity_type || 'all'}
                onValueChange={(val) => setFilters({ ...filters, entity_type: val === 'all' ? '' : val, page: 1 })}
              >
                <SelectTrigger className="h-11"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Action</Label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(val) => setFilters({ ...filters, action: val === 'all' ? '' : val, page: 1 })}
              >
                <SelectTrigger className="h-11"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.keys(ACTION_LABELS).map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_LABELS[action].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Per Page</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(val) => setFilters({ ...filters, limit: parseInt(val), page: 1 })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Activity Log ({pagination.total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const actionInfo = getActionInfo(log.action);
                    return (
                      <TableRow key={log._id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{log.entity_type}</p>
                            {log.entity_name && (
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{log.entity_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="text-xs text-muted-foreground">
                            {log.details ? (
                              <div className="space-y-1">
                                {log.details.invoice_number && (
                                  <p>Invoice: {log.details.invoice_number}</p>
                                )}
                                {log.details.invoice_type && (
                                  <p>Type: {log.details.invoice_type}</p>
                                )}
                                {log.details.total && (
                                  <p>Total: {formatCurrency(log.details.total)}</p>
                                )}
                                {log.details.quantity && (
                                  <p>Qty: {log.details.quantity}</p>
                                )}
                                {log.details.adjustment_type && (
                                  <p>Adjustment: {log.details.adjustment_type}</p>
                                )}
                                {log.details.to_staff && (
                                  <p>To: {log.details.to_staff}</p>
                                )}
                                {log.details.previous_stock !== undefined && log.details.new_stock !== undefined && (
                                  <p>Stock: {log.details.previous_stock} → {log.details.new_stock}</p>
                                )}
                              </div>
                            ) : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{log.performed_by_name || log.performed_by?.name || 'Unknown'}</p>
                            {log.performed_by?.role && (
                              <p className="text-xs text-muted-foreground capitalize">{log.performed_by.role}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}