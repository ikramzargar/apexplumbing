'use client';

import { Users, Wallet, Package, UserCheck, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

export function QuickStats({ stats }) {
  const rows = [
    { label: 'Active Plumbers', value: stats?.active_plumbers || 0, icon: Users, color: 'var(--color-primary)', type: 'number' },
    { label: 'Pending Payouts', value: stats?.pending_payouts_amount || 0, icon: Wallet, color: 'var(--color-warning)', type: 'currency' },
    { label: 'Low Stock Items', value: stats?.low_stock_count || 0, icon: AlertTriangle, color: 'var(--color-danger)', type: 'number', warning: (stats?.low_stock_count || 0) > 0 },
    { label: 'Pending Approvals', value: stats?.pending_approvals || 0, icon: AlertTriangle, color: 'var(--color-warning)', type: 'number', warning: (stats?.pending_approvals || 0) > 0 },
    { label: 'Active Distributors', value: stats?.active_distributors || 0, icon: UserCheck, color: 'var(--color-success)', type: 'number' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 h-full">
      <h3 className="text-[16px] font-semibold text-gray-900 mb-5">At a Glance</h3>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-6 px-6 transition-colors duration-150 cursor-default"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: row.color }} />
                <span className="text-[13px] text-gray-600">{row.label}</span>
              </div>
              <span
                className={`text-[14px] font-semibold ${
                  row.warning ? 'text-amber-600' : 'text-gray-900'
                }`}
              >
                {row.type === 'currency'
                  ? formatCurrency(row.value)
                  : (row.value || 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}