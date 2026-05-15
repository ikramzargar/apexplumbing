'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BonusSettingsCard } from '@/modules/settings/BonusSettingsCard';
import { CurrentSettingsCard } from '@/modules/settings/CurrentSettingsCard';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/lib/settings.api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const settings = data?.data || {};
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!form && settings.bonus_mode) {
      setForm({
        bonus_mode: settings.bonus_mode,
        fixed_amount: settings.fixed_amount || '',
        percentage_value: settings.percentage_value || '',
      });
    }
  }, [settings, form]);

  if (isLoading) {
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  if (!form) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        subtitle="Configure bonus calculations and system preferences"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BonusSettingsCard form={form} setForm={setForm} />
        </div>
        <div className="xl:col-span-1">
          <CurrentSettingsCard settings={settings} />
        </div>
      </div>
    </div>
  );
}