'use client';

import { useState } from 'react';
import { PlumberFilters } from '@/modules/plumbers/PlumberFilters';
import { PlumberTable } from '@/modules/plumbers/PlumberTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { useGetPlumbers, useDeletePlumber } from '@/hooks/usePlumbers';
import { showApiError } from '@/utils/toast';
import { Users } from 'lucide-react';

export default function PlumbersPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 50 });
  const [deleteDialog, setDeleteDialog] = useState(null);
  const { data, isLoading } = useGetPlumbers(filters);
  const deletePlumber = useDeletePlumber();

  const plumbers = data?.data?.plumbers || [];
  const pagination = data?.data?.pagination || {};

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await deletePlumber.mutateAsync(deleteDialog.plumberId);
    } catch (error) {
      showApiError(error);
    } finally {
      setDeleteDialog(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Plumbers"
        subtitle="Manage registered plumbers"
        actionLabel="Add Plumber"
        actionHref="/plumbers/new"
      />

      <PlumberFilters filters={filters} onFilter={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : data?.data?.plumbers?.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white">
          <EmptyState
            icon={Users}
            title="No plumbers found"
            description="Add your first plumber to get started"
            actionLabel="Add Plumber"
            actionHref="/plumbers/new"
          />
        </div>
      ) : (
        <>
          <PlumberTable
            data={data?.data}
            onEdit={(plumber) => window.location.href = `/plumbers/${plumber._id}`}
            onDelete={(plumber) => setDeleteDialog({ plumberId: plumber._id, plumberName: plumber.full_name })}
          />

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
        title="Delete Plumber"
        description={`Are you sure you want to delete ${deleteDialog?.plumberName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}