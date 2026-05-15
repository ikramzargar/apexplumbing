'use client';

import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Banknote, Calendar, User, CreditCard } from 'lucide-react';
import Link from 'next/link';

export function PayoutDetail({ payout }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/payouts">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-navy)]">Payout Details</h1>
          <p className="text-sm text-[var(--color-body-light)]">#{payout._id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-[var(--color-success)]">{formatCurrency(payout.amount)}</p>
            <Badge variant={payout.status === 'PAID' ? 'success' : 'warning'}>
              {payout.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-lg">
              <User size={18} className="text-[var(--color-body-light)]" />
              <div>
                <p className="text-xs text-[var(--color-body-light)]">Plumber</p>
                <p className="font-medium text-[var(--color-navy)]">{payout.plumber?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-lg">
              <CreditCard size={18} className="text-[var(--color-body-light)]" />
              <div>
                <p className="text-xs text-[var(--color-body-light)]">Method</p>
                <p className="font-medium text-[var(--color-navy)]">{payout.method}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-lg">
              <Calendar size={18} className="text-[var(--color-body-light)]" />
              <div>
                <p className="text-xs text-[var(--color-body-light)]">Created</p>
                <p className="font-medium text-[var(--color-navy)]">
                  {new Date(payout.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            {payout.paidAt && (
              <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-lg">
                <Banknote size={18} className="text-[var(--color-body-light)]" />
                <div>
                  <p className="text-xs text-[var(--color-body-light)]">Paid On</p>
                  <p className="font-medium text-[var(--color-navy)]">
                    {new Date(payout.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {payout.reference_number && (
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg">
              <p className="text-xs text-[var(--color-body-light)] mb-1">Reference Number</p>
              <p className="font-mono font-medium text-[var(--color-navy)]">{payout.reference_number}</p>
            </div>
          )}

          {payout.note && (
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg">
              <p className="text-xs text-[var(--color-body-light)] mb-1">Note</p>
              <p className="text-[var(--color-body)]">{payout.note}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}