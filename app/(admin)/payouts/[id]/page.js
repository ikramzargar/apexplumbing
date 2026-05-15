'use client';

import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PayoutDetail } from '@/modules/payouts/PayoutDetail';
import { useGetPayout } from '@/hooks/usePayouts';

export default function PayoutDetailPage() {
  const params = useParams();
  const payoutId = params.id;
  const { data, isLoading } = useGetPayout(payoutId);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const payout = data?.data;

  if (!payout) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-[#e8edf5] bg-white p-12 text-center">
          <p className="text-sm text-[#64748d]">Payout not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <PayoutDetail payout={payout} />
    </div>
  );
}