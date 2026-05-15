'use client';

import { useState, useEffect } from 'react';
import { getMyInventory } from '@/lib/stockRequest.api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Package, AlertCircle } from 'lucide-react';
import { Header } from '@/components/shared/Header';

const statusConfig = {
  'IN_STOCK': { label: 'In Stock', variant: 'success' },
  'OUT_OF_STOCK': { label: 'Out of Stock', variant: 'danger' },
};

export default function MyInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getMyInventory();
      setInventory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInventoryStatus = (quantity) => {
    return quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
  };

  const totalValue = inventory.reduce((sum, item) => {
    return sum + (item.quantity * (item.product?.wholesale_price || 0));
  }, 0);

  const inStockCount = inventory.filter((item) => item.quantity > 0).length;
  const outOfStockCount = inventory.filter((item) => item.quantity === 0).length;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-body-light)] uppercase tracking-wide mb-1">Total Products</p>
          <p className="text-2xl font-semibold text-[var(--color-navy)]">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-body-light)] uppercase tracking-wide mb-1">In Stock</p>
          <p className="text-2xl font-semibold text-[var(--color-success)]">{inStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-body-light)] uppercase tracking-wide mb-1">Total Value</p>
          <p className="text-2xl font-semibold text-[var(--color-navy)]">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
          <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-[var(--color-body-light)]" />
          </div>
          <h3 className="text-base font-medium text-[var(--color-navy)] mb-2">No inventory yet</h3>
          <p className="text-sm text-[var(--color-body-light)] mb-4">
            Submit a stock request to get products from admin
          </p>
          <p className="text-xs text-[var(--color-body-light)] flex items-center justify-center gap-1.5">
            <AlertCircle size={12} />
            Products will appear here once admin approves your requests
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Category
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Available
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Unit Price
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-body-light)] uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-subtle)]/50">
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-[var(--color-navy)]">
                      {item.product?.name || 'Unknown Product'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[var(--color-body)] font-mono">
                      {item.product?.sku || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-[var(--color-body)]">
                      {item.product?.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-sm font-semibold ${item.quantity > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm text-[var(--color-body)]">
                      {formatCurrency(item.product?.wholesale_price || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge
                      status={getInventoryStatus(item.quantity)}
                      config={statusConfig}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}