'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { showSuccess, showApiError } from '@/utils/toast';
import { getProducts } from '@/lib/products.api';
import api from '@/lib/axios';
import { formatCurrency } from '@/utils/formatCurrency';
import { Edit2, Package } from 'lucide-react';

export function ProductUpdateDialog() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    retail_price: '',
    wholesale_price: '',
    current_stock: ''
  });

  const queryClient = useQueryClient();

  const { data: productsData } = useQuery({
    queryKey: ['products-for-edit'],
    queryFn: () => getProducts({ limit: 200 }),
  });

  const products = productsData?.data?.products || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/products/${id}`, data),
    onSuccess: () => {
      showSuccess('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setOpen(false);
      setSelectedProduct(null);
    },
    onError: showApiError,
  });

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setForm({
      retail_price: product.retail_price?.toString() || '',
      wholesale_price: product.wholesale_price?.toString() || '',
      current_stock: product.current_stock?.toString() || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    updateMutation.mutate({
      id: selectedProduct._id,
      data: {
        retail_price: parseFloat(form.retail_price),
        wholesale_price: parseFloat(form.wholesale_price),
        current_stock: parseInt(form.current_stock)
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Edit2 className="w-4 h-4 mr-2" />
          Update Products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Update Products</DialogTitle>
        </DialogHeader>

        {!selectedProduct ? (
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs text-muted-foreground mb-3">
              {products.length} products available
            </div>
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs">Stock: {product.current_stock}</p>
                    <p className="text-xs">{formatCurrency(product.retail_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer"
              onClick={() => setSelectedProduct(null)}
            >
              <Package size={20} className="text-slate-500" />
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {selectedProduct.sku}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">← Change</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Retail Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.retail_price}
                  onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Wholesale Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.wholesale_price}
                  onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input
                type="number"
                value={form.current_stock}
                onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will set the exact stock value. Use stock adjustments for corrections.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="flex-1 sm:flex-none">
                {updateMutation.isPending ? 'Saving...' : 'Update Product'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}