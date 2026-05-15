'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetSalesChart } from '@/hooks/useDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-xl">
        <p className="text-xs font-semibold text-[var(--color-navy)] mb-2">{label}</p>
        <p className="text-xs text-[var(--color-accent)] font-medium">Retail: ₹{payload[0]?.value?.toLocaleString()}</p>
        <p className="text-xs text-[var(--color-success)] font-medium">Wholesale: ₹{payload[1]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  const [groupBy, setGroupBy] = useState('day');
  const { data, isLoading, error } = useGetSalesChart(null, null, groupBy);
  const chartData = data?.data || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <CardTitle className="flex items-center gap-3 text-sm font-semibold">
          <div className="p-2 rounded-lg bg-[var(--color-primary-light)]">
            <TrendingUp size={18} className="text-[var(--color-primary)]" />
          </div>
          <span className="text-[var(--color-navy)]">Sales Overview</span>
        </CardTitle>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-red-500 gap-2">
            <AlertCircle size={32} />
            <p className="text-sm">Failed to load chart data</p>
          </div>
        ) : (
          chartData.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-[var(--color-body-light)]">
              <AlertCircle size={32} className="mb-2 text-amber-500" />
              <p className="text-sm font-medium">No sales data available</p>
              <p className="text-xs mt-1">Check console for debug info</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-primary-light)' }} />
                <Bar dataKey="retail" name="Retail" fill="var(--color-accent)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="wholesale" name="Wholesale" fill="var(--color-success)" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </CardContent>
    </Card>
  );
}