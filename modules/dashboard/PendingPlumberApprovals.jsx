'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetPlumbers } from '@/hooks/usePlumbers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { UserCheck, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from '@/utils/formatCurrency';

export function PendingPlumberApprovals() {
  const { data, isLoading, error } = useGetPlumbers({ verification_status: 'PENDING', limit: 5 });
  const plumbers = data?.data?.plumbers || [];
  const pendingCount = data?.data?.pagination?.total || 0;

  console.log('PendingPlumberApprovals - pending plumbers:', plumbers, 'total pending:', pendingCount);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 border-b border-[var(--color-border)]">
        <CardTitle className="flex items-center gap-3 text-sm font-semibold">
          <div className="p-2 rounded-lg bg-amber-50">
            <Clock size={18} className="text-amber-500" />
          </div>
          <span className="text-[var(--color-navy)]">Pending Plumber Approvals</span>
          {plumbers.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{plumbers.length}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : plumbers.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-[var(--color-success)]">
            <UserCheck size={18} className="mr-2" />
            <span className="text-sm font-semibold">All plumbers verified!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {plumbers.slice(0, 5).map((plumber) => (
              <Link
                key={plumber._id}
                href={`/plumbers/${plumber._id}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-bg-subtle)] transition-all duration-150 border border-transparent hover:border-[var(--color-border)] group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-primary)] transition-colors">{plumber.full_name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Pending</span>
                  </div>
                  <p className="text-xs text-[var(--color-body-light)]">
                    {plumber.phone || 'No phone'}
                  </p>
                  <p className="text-xs text-[var(--color-body-light)] mt-0.5">
                    {plumber.district || 'No district'} · Applied {formatDistanceToNow(plumber.createdAt)}
                  </p>
                </div>
                <ArrowRight size={16} className="text-[var(--color-body-light)] group-hover:text-[var(--color-primary)] transition-colors" />
              </Link>
            ))}
            {plumbers.length > 5 && (
              <Link href="/plumbers?verification_status=PENDING" className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline pt-2">
                View all {plumbers.length} pending →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}