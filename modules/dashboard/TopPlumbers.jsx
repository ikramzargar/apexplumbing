'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTopPlumbers } from '@/hooks/useDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const RANK_COLORS = ['from-amber-400 to-amber-300', 'from-slate-300 to-slate-200', 'from-orange-400 to-orange-300'];

export function TopPlumbers() {
  const { data, isLoading, error } = useGetTopPlumbers(5);
  const plumbers = data?.data || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 border-b border-[var(--color-border)]">
        <CardTitle className="flex items-center gap-3 text-sm font-semibold">
          <div className="p-2 rounded-lg bg-amber-50">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <span className="text-[var(--color-navy)]">Top Plumbers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : plumbers.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={28} className="mx-auto text-[var(--color-body-light)] mb-3" />
            <p className="text-sm text-[var(--color-body-light)]">No data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {plumbers.map((plumber, index) => (
              <Link
                key={plumber._id}
                href={`/plumbers/${plumber._id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-subtle)] transition-all duration-150 border border-transparent hover:border-[var(--color-border)] group"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${RANK_COLORS[index] || 'from-[var(--color-primary)] to-[var(--color-primary-hover)]'} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-navy)] truncate group-hover:text-[var(--color-primary)] transition-colors">{plumber.name}</p>
                  <p className="text-xs text-[var(--color-body-light)]">{plumber.district} · {plumber.referralCount} referrals</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-[var(--color-success)]">{formatCurrency(plumber.totalBonus)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}