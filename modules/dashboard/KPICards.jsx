'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Wallet,
  Clock,
  AlertTriangle,
  BarChart3,
  FileText,
  CheckCircle
} from 'lucide-react';

const adminStatConfig = {
  today_sales: { icon: TrendingUp, label: "Today's Sales", color: '#7393B3', bg: '#7393B3', format: 'currency' },
  month_sales: { icon: DollarSign, label: 'Month Sales', color: '#7393B3', bg: '#7393B3', format: 'currency' },
  year_sales: { icon: BarChart3, label: 'Year Sales', color: '#7393B3', bg: '#7393B3', format: 'currency' },
  outstanding: { icon: Clock, label: 'Outstanding', color: '#7393B3', bg: '#7393B3', format: 'currency' },
  inventory: { icon: Package, label: 'Inventory Value', color: '#7393B3', bg: '#7393B3', format: 'currency' },
  plumbers: { icon: Users, label: 'Active Plumbers', color: '#7393B3', bg: '#7393B3', format: 'number' },
  payouts: { icon: Wallet, label: 'Pending Payouts', color: '#7393B3', bg: '#7393B3', format: 'currency' },
  approvals: { icon: Clock, label: 'Pending Approvals', color: '#7393B3', bg: '#7393B3', format: 'number' },
  low_stock: { icon: AlertTriangle, label: 'Low Stock', color: '#7393B3', bg: '#7393B3', format: 'number' },
};

const staffStatConfig = {
  today_sales: { icon: TrendingUp, label: "Today's Sales", color: '#7393B3', bg: '#7393B3', format: 'currency' },
  month_sales: { icon: DollarSign, label: 'Month Sales', color: '#7393B3', bg: '#7393B3', format: 'currency' },
  total_invoices: { icon: FileText, label: 'Total Invoices', color: '#7393B3', bg: '#7393B3', format: 'number' },
  confirmed: { icon: CheckCircle, label: 'Confirmed', color: '#7393B3', bg: '#7393B3', format: 'number' },
  pending: { icon: Clock, label: 'Pending', color: '#7393B3', bg: '#7393B3', format: 'number' },
};

const adminStatKeys = {
  today_sales: 'total_sales_today',
  month_sales: 'total_sales_month',
  year_sales: 'total_sales_year',
  outstanding: 'total_outstanding',
  inventory: 'inventory_value',
  plumbers: 'active_plumbers',
  payouts: 'pending_payouts_amount',
  approvals: 'pending_approvals',
  low_stock: 'low_stock_count',
};

const staffStatKeys = {
  today_sales: 'total_sales_today',
  month_sales: 'total_sales_month',
  total_invoices: 'total_invoices',
  confirmed: 'confirmed_invoices',
  pending: 'pending_invoices',
};

// Format value based on type
const formatValue = (value, format) => {
  if (value === null || value === undefined) return 0;
  if (format === 'currency') {
    return formatCurrency(value);
  }
  return value;
};

export function KPICards({ stats }) {
  // Safety check - ensure stats exists
  if (!stats || typeof stats !== 'object') {
    stats = {};
  }

  const isStaff = stats?.isStaff === true;
  const statConfig = isStaff ? staffStatConfig : adminStatConfig;
  const statKeys = isStaff ? staffStatKeys : adminStatKeys;

  const displayStats = Object.entries(statConfig).map(([key, config]) => {
    const statKey = statKeys[key];
    const rawValue = stats?.[statKey];
    const value = typeof rawValue === 'number' ? rawValue : 0;

    return {
      key,
      ...config,
      value,
      isAlert: key === 'low_stock' && value > 0,
    };
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {displayStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.key}
            className={`
              relative overflow-hidden transition-all duration-200 bg-[var(--color-surface)]
              hover:shadow-lg hover:-translate-y-0.5
              ${stat.isAlert ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]' : ''}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute inset-0 bg-[var(--color-surface)]" />
            <CardContent className="relative p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl flex-shrink-0 shadow-sm" style={{ backgroundColor: '#7393B3' }}>
                  <Icon size={22} style={{ color: '#fff' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--color-body-light)] uppercase tracking-wide font-semibold mb-1 truncate">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold truncate ${stat.isAlert ? 'text-[var(--color-danger)]' : 'text-[var(--color-navy)]'}`}>
                    {formatValue(stat.value, stat.format)}
                  </p>
                </div>
              </div>
              {stat.isAlert && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-[var(--color-danger)] rounded-full animate-pulse" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}