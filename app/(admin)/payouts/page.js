'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetPayouts, useGetPendingPayouts, useGetPendingBalances, useCreatePayout, useApprovePayout, useMarkPayoutPaid, useCancelPayout } from '@/hooks/usePayouts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PendingPayoutsSection } from '@/modules/payouts/PendingPayoutsSection';
import { MakePayoutSection } from '@/modules/payouts/MakePayoutSection';
import { DonePayoutsSection } from '@/modules/payouts/DonePayoutsSection';
import { showApiError } from '@/utils/toast';

export default function PayoutsPage() {
  const { data: pendingPayoutsData, isLoading: pendingLoading } = useGetPendingPayouts();
  const { data: donePayoutsData, isLoading: doneLoading } = useGetPayouts({ status: 'PAID' });
  const { data: pendingBalancesData, isLoading: balancesLoading } = useGetPendingBalances();
  const createPayout = useCreatePayout();
  const approvePayout = useApprovePayout();
  const markPaid = useMarkPayoutPaid();
  const cancelPayout = useCancelPayout();

  const handleCreatePayout = async (plumberId, formData) => {
    try {
      await createPayout.mutateAsync({ plumberId, ...formData });
    } catch (error) {
      showApiError(error);
    }
  };

  const handleApprove = (id) => approvePayout.mutate(id);
  const handleMarkPaid = (id) => markPaid.mutate(id);
  const handleCancel = (id) => cancelPayout.mutate(id);

  const isLoading = pendingLoading || doneLoading || balancesLoading;

  return (
    <div>
      <div className="p-4 md:p-6 space-y-6">
        <PageHeader
          title="Payouts"
          subtitle="Manage plumber bonus payouts"
        />

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="h-11 bg-[var(--color-bg-subtle)] p-1 rounded-xl w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="pending" className="rounded-lg px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              Pending
            </TabsTrigger>
            <TabsTrigger value="make" className="rounded-lg px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              Make Payout
            </TabsTrigger>
            <TabsTrigger value="done" className="rounded-lg px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              Done
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <PendingPayoutsSection
                data={pendingPayoutsData?.data}
                onApprove={handleApprove}
                onMarkPaid={handleMarkPaid}
                onCancel={handleCancel}
              />
            )}
          </TabsContent>

          <TabsContent value="make">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <MakePayoutSection
                balances={pendingBalancesData?.data}
                onCreate={handleCreatePayout}
                isCreating={createPayout.isPending}
              />
            )}
          </TabsContent>

          <TabsContent value="done">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <DonePayoutsSection data={donePayoutsData?.data?.payouts} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}