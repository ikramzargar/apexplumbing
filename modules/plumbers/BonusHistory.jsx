'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { useGetPlumberBonuses } from '@/hooks/usePlumbers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Gift } from 'lucide-react';

export function BonusHistory({ plumberId }) {
  const { data, isLoading } = useGetPlumberBonuses(plumberId);
  const bonuses = data?.data || [];

  if (isLoading) return <div className="py-8"><LoadingSpinner /></div>;

  if (bonuses.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mx-auto mb-3">
            <Gift size={20} className="text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">No bonus history</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Referral bonuses will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Bonus History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bonuses.map((bonus) => (
              <TableRow key={bonus._id}>
                <TableCell className="text-xs text-[var(--color-text-muted)] hidden sm:table-cell">
                  {new Date(bonus.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="font-mono text-xs text-[var(--color-text-muted)]">{bonus.invoice?.invoice_number || 'N/A'}</TableCell>
                <TableCell className="text-right font-semibold text-[var(--color-success)]">{formatCurrency(bonus.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell"><StatusBadge status={bonus.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}