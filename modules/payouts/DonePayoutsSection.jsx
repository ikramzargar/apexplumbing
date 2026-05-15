'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatCurrency';
import { CheckCircle } from 'lucide-react';

export function DonePayoutsSection({ data }) {
  const payouts = data || [];

  if (payouts.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-subtle)] flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={28} className="text-[var(--color-body-light)]" />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-navy)] mb-2">No completed payouts</h3>
        <p className="text-sm text-[var(--color-body-light)]">Paid payouts will appear here</p>
      </div>
    );
  }

  const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-[var(--color-success)]/10 rounded-xl border border-[var(--color-success)]/20">
        <p className="text-xs text-[var(--color-success)] font-medium mb-1">Total Paid</p>
        <p className="text-2xl font-bold text-[var(--color-success)]">{formatCurrency(totalPaid)}</p>
        <p className="text-xs text-[var(--color-body-light)] mt-1">{payouts.length} payout{payouts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">ID</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Plumber</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Method</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Reference</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Paid On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout._id} className="border-b border-[var(--color-border)] last:border-0">
                  <TableCell className="font-mono text-sm text-[var(--color-body-light)]">
                    #{payout._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-semibold text-[var(--color-navy)]">{payout.plumber?.full_name}</TableCell>
                  <TableCell className="font-bold text-[var(--color-success)]">{formatCurrency(payout.amount)}</TableCell>
                  <TableCell className="text-[var(--color-body)]">{payout.method}</TableCell>
                  <TableCell className="text-sm text-[var(--color-body-light)]">
                    {payout.reference_number || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--color-body-light)]">
                    {payout.paidAt
                      ? new Date(payout.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}