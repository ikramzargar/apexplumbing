'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlumberForm } from '@/modules/plumbers/PlumberForm';
import { useCreatePlumber } from '@/hooks/usePlumbers';
import { showApiError } from '@/utils/toast';

export default function NewPlumberPage() {
  const router = useRouter();
  const createPlumber = useCreatePlumber();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createPlumber.mutateAsync(formData);
      router.push('/plumbers');
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Add New Plumber</h2>
        <p className="text-xs text-[var(--color-text-muted)]">Register a new plumber in the system</p>
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 md:p-6">
        <PlumberForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}