'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlumberProfile } from '@/modules/plumbers/PlumberProfile';
import { PlumberForm } from '@/modules/plumbers/PlumberForm';
import { VerifyPlumberDialog } from '@/modules/plumbers/VerifyPlumberDialog';
import { useGetPlumber, useVerifyPlumber, useUpdatePlumber } from '@/hooks/usePlumbers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { showSuccess, showApiError } from '@/utils/toast';

export default function PlumberDetailPage() {
  const params = useParams();
  const plumberId = params.id;
  const { data, isLoading, refetch } = useGetPlumber(plumberId);
  const verifyPlumber = useVerifyPlumber();
  const updatePlumber = useUpdatePlumber();
  const [verifyDialog, setVerifyDialog] = useState({ open: false, plumber: null });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const plumber = data?.data;

  const handleVerify = async (status) => {
    try {
      await verifyPlumber.mutateAsync({ id: plumberId, status });
      setVerifyDialog({ open: false, plumber: null });
      refetch();
    } catch (error) {
      showApiError(error);
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await updatePlumber.mutateAsync({ id: plumberId, data: formData });
      setIsEditing(false);
      refetch();
    } catch (error) {
      showApiError(error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">{plumber?.full_name || 'Plumber'}</h2>
          <p className="text-xs text-[var(--color-text-muted)]">ID: {plumberId}</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2 flex-shrink-0">
            <Edit size={16} />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 md:p-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">Edit Plumber</h3>
          <PlumberForm initialData={plumber} onSubmit={handleUpdate} loading={saving} />
          <div className="mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <PlumberProfile plumber={plumber} />
      )}

      <VerifyPlumberDialog
        open={verifyDialog.open}
        plumber={verifyDialog.plumber}
        onConfirm={handleVerify}
        onCancel={() => setVerifyDialog({ open: false, plumber: null })}
      />
    </div>
  );
}