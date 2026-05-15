'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useGetProducts } from '@/hooks/useProducts';
import { useGetCurrentStock, useStockIn } from '@/hooks/useStock';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { showApiError } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Lock, Settings, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StockLockManager } from '@/modules/stock/StockLockManager';
import { StockAdjustmentDialog } from '@/modules/stock/StockAdjustmentDialog';
import { ProductUpdateDialog } from '@/modules/stock/ProductUpdateDialog';
import { Pagination } from '@/components/shared/Pagination';

export default function StockPage() {
  const { isSuperAdmin, isAdmin, isStaff } = useAuth();
  const canAddStock = isSuperAdmin || isAdmin;
  const canUpdateProducts = isSuperAdmin || isAdmin || isStaff;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 50 });
  const { data: stockData, isLoading: stockLoading } = useGetCurrentStock(filters);
  const products = Array.isArray(stockData?.data) ? stockData.data : (stockData?.data?.products || []);
  const pagination = stockData?.data?.pagination || {};

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title="Stock Management" subtitle="Track and manage inventory levels" />
        <div className="flex flex-wrap gap-2">
          {canUpdateProducts && <ProductUpdateDialog />}
          {canAddStock && (
            <>
              <StockAdjustmentDialog />
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-sm shadow-[var(--color-primary)]/[0.2]"><Plus className="w-4 h-4 mr-2" />Add Stock</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Package size={18} className="text-[var(--color-primary)]" />
                      Add Stock
                    </DialogTitle>
                  </DialogHeader>
                  <StockInForm onSuccess={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
          
      {isSuperAdmin && (
        <StockLockManager />
      )}

        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-3 pb-3">
                <div className="p-2 rounded-lg bg-[var(--color-primary-light)]">
                  <Package size={18} className="text-[var(--color-primary)]" />
                </div>
                <span className="text-[var(--color-navy)]">Current Stock Levels</span>
              </CardTitle>
              <span className="text-xs font-medium text-[var(--color-body-light)]">{products.length} products</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stockLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package size={40} className="mx-auto text-[var(--color-body-light)] mb-3" />
                <p className="text-sm text-[var(--color-body-light)]">No products found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Product</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">SKU</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Category</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Stock</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Threshold</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Value</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product._id}
                      className={`group hover:bg-[var(--color-bg-subtle)] transition-colors duration-150 border-b border-[var(--color-border)] last:border-0 ${product.is_low_stock ? 'bg-red-50/30' : ''}`}
                    >
                      <TableCell className="font-semibold text-[var(--color-navy)]">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm text-[var(--color-body-light)]">{product.sku}</TableCell>
                      <TableCell className="text-[var(--color-body)]">{product.category}</TableCell>
                      <TableCell className={`text-right font-bold ${product.is_low_stock ? 'text-[var(--color-danger)]' : 'text-[var(--color-navy)]'}`}>{product.current_stock}</TableCell>
                      <TableCell className="text-right text-[var(--color-body)]">{product.low_stock_threshold}</TableCell>
                      <TableCell className="text-right font-semibold text-[var(--color-success)]">{formatCurrency(product.stock_value)}</TableCell>
                      <TableCell>
                        {product.is_low_stock ? (
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-[var(--color-danger)]" />
                            <StatusBadge status="LOW" />
                          </div>
                        ) : (
                          <StatusBadge status="OK" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

function StockInForm({ onSuccess }) {
  const { data: productsData } = useGetProducts({ limit: 100 });
  const stockIn = useStockIn();
  const [form, setForm] = useState({ product_id: '', quantity: '' });
  const [loading, setLoading] = useState(false);

  const products = productsData?.data?.products || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await stockIn.mutateAsync({ product_id: form.product_id, quantity: parseInt(form.quantity) });
      onSuccess();
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label className="text-sm font-medium text-[var(--color-navy)]">Product *</Label>
        <Select value={form.product_id} onValueChange={(val) => setForm({ ...form, product_id: val })}>
          <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select product" /></SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p._id} value={p._id}>{p.name} ({p.sku})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium text-[var(--color-navy)]">Quantity *</Label>
        <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required className="mt-1.5 h-11" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="shadow-sm shadow-[var(--color-primary)]/[0.2]">{loading ? 'Adding...' : 'Add Stock'}</Button>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
      </div>
    </form>
  );
}