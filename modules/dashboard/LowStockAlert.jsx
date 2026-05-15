'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetLowStock } from '@/hooks/useStock';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function LowStockAlert() {
  const { data, isLoading, error } = useGetLowStock();
  const products = data?.data || [];
  const hasAlert = products.length > 0;

  return (
    <Card className={`overflow-hidden ${hasAlert ? 'border-[var(--color-danger)]' : ''}`}>
      <CardHeader className="pb-4 border-b border-[var(--color-border)]">
        <CardTitle className="flex items-center gap-3 text-sm font-semibold">
          <div className={`p-2 rounded-lg ${hasAlert ? 'bg-red-50' : 'bg-green-50'}`}>
            <AlertTriangle size={18} className={hasAlert ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'} />
          </div>
          <span className="text-[var(--color-navy)]">Low Stock Alert</span>
          {hasAlert && <span className="ml-auto text-xs font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-2.5 py-1 rounded-full">{products.length}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : !hasAlert ? (
          <div className="flex items-center justify-center py-6 text-[var(--color-success)]">
            <CheckCircle size={18} className="mr-2" />
            <span className="text-sm font-semibold">All stock levels healthy</span>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <Link
                key={product._id}
                href="/stock"
                className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 hover:bg-red-50 transition-all duration-150 border border-red-100 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-danger)] truncate group-hover:translate-x-1 transition-transform">{product.name}</p>
                  <p className="text-xs text-red-400 mt-0.5">Min: {product.low_stock_threshold}</p>
                </div>
                <span className="text-xl font-bold text-[var(--color-danger)] ml-4">{product.current_stock}</span>
              </Link>
            ))}
            {products.length > 5 && (
              <Link href="/stock" className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline pt-2">
                View all {products.length} items →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}