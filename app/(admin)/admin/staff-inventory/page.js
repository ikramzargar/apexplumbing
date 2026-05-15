'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllStaffInventories, getTransfers, getStaffNames } from '@/lib/staffInventory.api';
import { TransferForm } from '@/modules/staff-inventory/TransferForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Package, ArrowRightLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StaffInventoryAdminPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [filters, setFilters] = useState({ staff: '', search: '' });
  const [transferOpen, setTransferOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['all-staff-inventories', filters],
    queryFn: () => getAllStaffInventories(filters)
  });

  const { data: transfersData, isLoading: transfersLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => getTransfers({ limit: 100 })
  });

  const { data: staffNames } = useQuery({
    queryKey: ['staff-names'],
    queryFn: getStaffNames
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
        <PageHeader
          title="Staff Inventory"
          subtitle="Manage staff personal inventory and transfers"
          action={
            <Button onClick={() => setTransferOpen(true)} className="w-full sm:w-auto shadow-sm shadow-[var(--color-primary)]/[0.2]">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transfer Stock
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-11 bg-[var(--color-bg-subtle)] p-1 rounded-xl">
            <TabsTrigger value="inventory" className="rounded-lg px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Package size={16} className="mr-2" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="transfers" className="rounded-lg px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ArrowRightLeft size={16} className="mr-2" /> Transfer History
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'inventory' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-body-light)]" />
                <Input
                  placeholder="Search product..."
                  className="pl-10 h-11"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Select
                value={filters.staff || 'all'}
                onValueChange={(val) => setFilters({ ...filters, staff: val === 'all' ? '' : val })}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffNames?.data?.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>{staff.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="border-b border-[var(--color-border)] p-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-primary-light)]">
                    <Package size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <span className="text-[var(--color-navy)]">Staff Inventory</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : data?.inventory?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={40} className="mx-auto text-[var(--color-body-light)] mb-3" />
                    <p className="text-sm text-[var(--color-body-light)]">No staff inventory found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                          <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Staff Member</TableHead>
                          <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Product</TableHead>
                          <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 hidden sm:table-cell">SKU</TableHead>
                          <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 hidden sm:table-cell">Category</TableHead>
                          <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Qty</TableHead>
                          <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.inventory?.map((item) => (
                          <TableRow key={item._id} className="group hover:bg-[var(--color-bg-subtle)] transition-colors duration-150 border-b border-[var(--color-border)] last:border-0">
                            <TableCell className="font-semibold text-[var(--color-navy)]">{item.staff_name}</TableCell>
                            <TableCell className="text-[var(--color-body)]">{item.product_name}</TableCell>
                            <TableCell className="font-mono text-sm text-[var(--color-body-light)] hidden sm:table-cell">{item.product_sku}</TableCell>
                            <TableCell className="text-[var(--color-body)] hidden sm:table-cell">{item.category}</TableCell>
                            <TableCell className="text-right font-bold text-[var(--color-navy)]">{item.quantity}</TableCell>
                            <TableCell>
                              <StatusBadge
                                status={item.status}
                                variants={{ OK: 'success', LOW: 'warning', OUT: 'destructive' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'transfers' && (
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b border-[var(--color-border)] p-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-primary-light)]">
                  <ArrowRightLeft size={18} className="text-[var(--color-primary)]" />
                </div>
                <span className="text-[var(--color-navy)]">Transfer History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transfersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : transfersData?.transfers?.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRightLeft size={40} className="mx-auto text-[var(--color-body-light)] mb-3" />
                  <p className="text-sm text-[var(--color-body-light)]">No transfers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 hidden sm:table-cell">From</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 hidden sm:table-cell">From Staff</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">To Staff</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 hidden sm:table-cell">Product</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Qty</TableHead>
                        <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 hidden sm:table-cell">Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfersData?.transfers?.map((transfer) => (
                        <TableRow key={transfer._id} className="group hover:bg-[var(--color-bg-subtle)] transition-colors duration-150 border-b border-[var(--color-border)] last:border-0">
                          <TableCell className="text-sm text-[var(--color-body-light)]">{new Date(transfer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                          <TableCell className="hidden sm:table-cell"><StatusBadge status={transfer.from_type} variants={{ MAIN: 'primary', STAFF: 'secondary' }} /></TableCell>
                          <TableCell className="text-[var(--color-body)] hidden sm:table-cell">{transfer.from_staff_name || '-'}</TableCell>
                          <TableCell className="font-semibold text-[var(--color-navy)]">{transfer.to_staff_name}</TableCell>
                          <TableCell className="text-[var(--color-body)] hidden sm:table-cell">{transfer.product_name}</TableCell>
                          <TableCell className="text-right font-bold text-[var(--color-navy)]">{transfer.quantity}</TableCell>
                          <TableCell className="text-[var(--color-body)] hidden sm:table-cell">{transfer.note || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <TransferForm
          open={transferOpen}
          onOpenChange={setTransferOpen}
          onSuccess={() => {}}
        />
      </div>
  );
}