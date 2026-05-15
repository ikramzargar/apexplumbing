'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { showSuccess, showApiError, showError } from '@/utils/toast';
import { getProducts } from '@/lib/products.api';
import api from '@/lib/axios';
import { Plus, Settings } from 'lucide-react';

export function StockAdjustmentDialog({ productId, productName, currentStock, onSuccess }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: productId || '',
    adjustment_type: 'INCREMENT',
    quantity: '',
    reason: 'CORRECTION',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const { data: productsData } = useQuery({
    queryKey: ['products-for-adjustment'],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const products = productsData?.data?.products || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.product_id) {
      showError('Please select a product');
      return;
    }

    const qty = parseInt(form.quantity);
    if (!qty || qty <= 0) {
      showError('Please enter a valid quantity');
      return;
    }

    if (form.adjustment_type === 'DECREMENT' && qty > currentStock) {
      showError(`Cannot reduce by ${qty}. Current stock is only ${currentStock}`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/stock/adjust', {
        product_id: form.product_id,
        adjustment_type: form.adjustment_type,
        quantity: qty,
        reason: form.reason,
        notes: form.notes
      });

      showSuccess('Stock adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Adjust Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!productId && (
            <div className="space-y-1.5">
              <Label>Product *</Label>
              <Select
                value={form.product_id}
                onValueChange={(val) => setForm({ ...form, product_id: val })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} (Stock: {p.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Adjustment Type *</Label>
            <Select
              value={form.adjustment_type}
              onValueChange={(val) => setForm({ ...form, adjustment_type: val })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCREMENT">Add Stock (+)</SelectItem>
                <SelectItem value="DECREMENT">Remove Stock (-)</SelectItem>
                <SelectItem value="CORRECTION">Set Exact Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              {form.adjustment_type === 'CORRECTION'
                ? 'New Stock Value *'
                : 'Quantity *'}
            </Label>
            <Input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder={
                form.adjustment_type === 'INCREMENT'
                  ? 'Amount to add'
                  : form.adjustment_type === 'DECREMENT'
                  ? `Max: ${currentStock}`
                  : 'Enter new stock value'
              }
            />
            {form.adjustment_type !== 'CORRECTION' && (
              <p className="text-xs text-muted-foreground">
                Current stock: {currentStock}
                {form.adjustment_type === 'INCREMENT' && form.quantity && (
                  <span className="text-green-600 ml-2">
                    → New: {currentStock + parseInt(form.quantity || 0)}
                  </span>
                )}
                {form.adjustment_type === 'DECREMENT' && form.quantity && (
                  <span className="text-red-600 ml-2">
                    → New: {currentStock - parseInt(form.quantity || 0)}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Select
              value={form.reason}
              onValueChange={(val) => setForm({ ...form, reason: val })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="FOUND">Found (Stock Found)</SelectItem>
                <SelectItem value="CORRECTION">Correction</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="THEFT">Theft / Missing</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
              {loading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}