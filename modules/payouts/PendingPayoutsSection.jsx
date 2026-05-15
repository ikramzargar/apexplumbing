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
import { Button } from '@/components/ui/button';
import { CheckCircle, Banknote, XCircle, Check } from 'lucide-react';

export function PendingPayoutsSection({ data, onApprove, onMarkPaid, onCancel }) {
  const pending = data?.pending || [];
  const approved = data?.approved || [];
  const allPending = [...pending, ...approved];

  if (allPending.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-subtle)] flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={28} className="text-[var(--color-body-light)]" />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-navy)] mb-2">No pending payouts</h3>
        <p className="text-sm text-[var(--color-body-light)]">All payouts have been processed</p>
      </div>
    );
  }

  const totalAmount = allPending.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--color-warning)]/10 rounded-xl border border-[var(--color-warning)]/20">
          <p className="text-xs text-[var(--color-warning)] font-medium mb-1">Awaiting Approval</p>
          <p className="text-2xl font-bold text-[var(--color-warning)]">
            {formatCurrency(pending.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
        <div className="p-4 bg-[var(--color-primary)]/10 rounded-xl border border-[var(--color-primary)]/20">
          <p className="text-xs text-[var(--color-primary)] font-medium mb-1">Ready to Pay</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">
            {formatCurrency(approved.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
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
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPending.map((payout) => (
                <TableRow key={payout._id} className="border-b border-[var(--color-border)] last:border-0">
                  <TableCell className="font-mono text-sm text-[var(--color-body-light)]">
                    #{payout._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-semibold text-[var(--color-navy)]">{payout.plumber?.full_name}</TableCell>
                  <TableCell className="font-bold text-[var(--color-warning)]">{formatCurrency(payout.amount)}</TableCell>
                  <TableCell className="text-[var(--color-body)]">{payout.method}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      payout.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payout.status === 'APPROVED' ? 'Approved' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payout.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => onApprove(payout._id)}
                          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs font-medium"
                        >
                          <Check size={12} /> Approve
                        </Button>
                      )}
                      {payout.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          onClick={() => onMarkPaid(payout._id)}
                          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs font-medium"
                        >
                          <Banknote size={12} /> Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCancel(payout._id)}
                        className="gap-1.5 h-8 px-3 text-xs font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <XCircle size={12} /> Cancel
                      </Button>
                    </div>
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