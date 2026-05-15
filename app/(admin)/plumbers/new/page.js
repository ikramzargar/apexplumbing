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
        <h2 className="text-lg font-semibold text-[#061b31]">Add New Plumber</h2>
        <p className="text-xs text-[#64748d]">Register a new plumber in the system</p>
      </div>
      <div className="rounded-xl border border-[#e8edf5] bg-white p-4 md:p-6">
        <PlumberForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}