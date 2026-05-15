'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SupplierForm } from './SupplierForm';
import { getSuppliers, deleteSupplier } from '@/lib/suppliers.api';
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { showSuccess, showApiError } from '@/utils/toast';

export function SupplierList() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['suppliers', { search }],
    queryFn: () => getSuppliers({ search }),
  });

  const suppliers = data?.data?.suppliers || [];
  const pagination = data?.data?.pagination || {};

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { deleteSupplier } = await import('@/lib/suppliers.api');
      await deleteSupplier(id);
      showSuccess('Supplier deactivated');
      refetch();
    } catch (err) {
      showApiError(err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
    refetch();
  };

  const handleFormCancel = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Add Supplier</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            </DialogHeader>
            <SupplierForm
              supplier={editingSupplier}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No suppliers found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="hidden sm:table-cell">Business Name</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">District</TableHead>
                <TableHead className="hidden sm:table-cell">GSTIN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier._id}>
                  <TableCell className="font-medium hidden sm:table-cell">{supplier.business_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{supplier.contact_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{supplier.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {supplier.email ? (
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-muted-foreground" />
                        <span className="text-xs truncate max-w-[100px]">{supplier.email}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {supplier.district ? (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-muted-foreground" />
                        {supplier.district}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{supplier.gstin || '-'}</TableCell>
                  <TableCell>
                    {supplier.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeletingId(supplier._id);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => refetch()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => refetch()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Supplier?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This supplier will be deactivated but not deleted. You can reactivate them later.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deletingId)}
              disabled={deletingId}
              className="flex-1 sm:flex-none"
            >
              {deletingId ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}