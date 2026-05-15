'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { useGetPlumberPayouts } from '@/hooks/usePlumbers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wallet } from 'lucide-react';

export function PayoutHistory({ plumberId }) {
  const { data, isLoading } = useGetPlumberPayouts(plumberId);
  const payouts = data?.data || [];

  if (isLoading) return <div className="py-8"><LoadingSpinner /></div>;

  if (payouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-3">
            <Wallet size={20} className="text-[#94a3b8]" />
          </div>
          <h3 className="text-sm font-medium text-[#061b31] mb-1">No payout history</h3>
          <p className="text-xs text-[#94a3b8]">Payouts will appear here once processed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Payout History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Method</TableHead>
              <TableHead className="hidden sm:table-cell">Reference</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout._id}>
                <TableCell className="text-xs text-[#64748d] hidden sm:table-cell">
                  {new Date(payout.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right font-semibold text-[#15be53]">{formatCurrency(payout.amount)}</TableCell>
                <TableCell className="text-[#64748d] hidden sm:table-cell">{payout.method}</TableCell>
                <TableCell className="text-xs font-mono text-[#94a3b8] hidden sm:table-cell">{payout.reference_number || '-'}</TableCell>
                <TableCell className="hidden sm:table-cell"><StatusBadge status={payout.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}