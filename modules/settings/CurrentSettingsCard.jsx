'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Calendar, BadgeDollarSign, Percent } from 'lucide-react';

const getModeLabel = (mode) => {
  switch (mode) {
    case 'FIXED': return 'Fixed Amount';
    case 'PERCENTAGE': return 'Percentage';
    default: return mode;
  }
};

const StatItem = ({ icon: Icon, label, value, highlight }) => (
  <div className={`p-4 rounded-xl border ${highlight ? 'bg-[#533afd]/5 border-[#533afd]/20' : 'bg-slate-50/70 border-slate-200/50'}`}>
    <div className="flex items-center gap-2 mb-1.5">
      <Icon className={`w-4 h-4 ${highlight ? 'text-[#533afd]' : 'text-slate-400'}`} />
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
    <p className={`text-lg font-semibold ${highlight ? 'text-[#533afd]' : 'text-slate-800'}`}>
      {value}
    </p>
  </div>
);

export function CurrentSettingsCard({ settings }) {
  const modeHighlight = settings.bonus_mode === 'FIXED' ? 'fixed_amount' : 'percentage_value';

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
          <CardTitle className="text-base">Active Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-3">
          <StatItem
            icon={Settings}
            label="Bonus Mode"
            value={getModeLabel(settings.bonus_mode) || 'Not set'}
            highlight
          />
          <StatItem
            icon={BadgeDollarSign}
            label="Fixed Amount"
            value={settings.fixed_amount ? `₹${settings.fixed_amount}` : '—'}
          />
          <StatItem
            icon={Percent}
            label="Percentage"
            value={settings.percentage_value ? `${settings.percentage_value}%` : '—'}
          />
          <StatItem
            icon={Calendar}
            label="Last Updated"
            value={settings.updated_at
              ? new Date(settings.updated_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Never'
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}