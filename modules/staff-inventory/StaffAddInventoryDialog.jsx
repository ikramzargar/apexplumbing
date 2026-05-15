'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showApiError, showError } from '@/utils/toast';
import { getProducts } from '@/lib/products.api';
import { addStaffInventory } from '@/lib/staffInventory.api';
import { Plus, Search, Package, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Tanks', 'Pipes', 'Fittings', 'Valves', 'Other'];
const UNITS = ['pieces', 'meters', 'sets'];

export function StaffAddInventoryDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Other',
    unit: 'pieces',
    retail_price: '',
    wholesale_price: '',
    cost_price: ''
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-for-staff-add'],
    queryFn: () => getProducts({ limit: 500 }),
    enabled: mode === 'select'
  });

  const products = productsData?.data?.products || [];
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const addMutation = useMutation({
    mutationFn: addStaffInventory,
    onSuccess: (data) => {
      showSuccess(data.data?.is_new_product
        ? `New product "${data.data.product_name}" added with ${quantity} units`
        : `Added ${quantity} units of ${selectedProduct?.name || data.data.product_name}`);
      queryClient.invalidateQueries({ queryKey: ['my-inventory'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => {
      showApiError(err);
    }
  });

  const resetForm = () => {
    setMode('select');
    setSelectedProduct(null);
    setQuantity('');
    setNote('');
    setSearch('');
    setNewProduct({
      name: '',
      sku: '',
      category: 'Other',
      unit: 'pieces',
      retail_price: '',
      wholesale_price: '',
      cost_price: ''
    });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity('1');
  };

  const handleSubmitExisting = (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      showError('Please select a product and enter quantity');
      return;
    }
    addMutation.mutate({
      product_id: selectedProduct._id,
      quantity: parseInt(quantity),
      note
    });
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.retail_price) {
      showError('Product name, SKU, and retail price are required');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      showError('Please enter quantity');
      return;
    }
    addMutation.mutate({
      new_product: {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unit: newProduct.unit,
        retail_price: parseFloat(newProduct.retail_price),
        wholesale_price: parseFloat(newProduct.wholesale_price) || parseFloat(newProduct.retail_price),
        cost_price: parseFloat(newProduct.cost_price) || 0
      },
      quantity: parseInt(quantity),
      note: note || 'Staff added new product to inventory'
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to Inventory</DialogTitle>
        </DialogHeader>

        {mode === 'select' && !selectedProduct && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2 mb-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Select Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('create')}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Product
              </Button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No products found</p>
                  <Button variant="outline" size="sm" onClick={() => setMode('create')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create New Product
                  </Button>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {product.sku} • {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{product.retail_price?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per {product.unit}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {mode === 'create' && !selectedProduct && (
          <form onSubmit={handleCreateNew} className="flex-1 overflow-y-auto space-y-4">
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Select Product
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                type="button"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Product
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g., 1 inch PVC Elbow"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input
                  placeholder="e.g., PVC-EL-01"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cost Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.cost_price}
                  onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Retail Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.retail_price}
                  onChange={(e) => setNewProduct({ ...newProduct, retail_price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Wholesale Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.wholesale_price}
                  onChange={(e) => setNewProduct({ ...newProduct, wholesale_price: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2 pt-4 border-t">
                <Label>Quantity to Add *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="e.g., Purchased from local supplier"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending} className="flex-1 sm:flex-none">
                {addMutation.isPending ? 'Adding...' : 'Add to Inventory'}
              </Button>
            </div>
          </form>
        )}

        {selectedProduct && (
          <form onSubmit={handleSubmitExisting} className="space-y-4">
            <div
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer"
              onClick={() => setSelectedProduct(null)}
            >
              <Package size={20} className="text-slate-500" />
              <div className="flex-1">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">
                  SKU: {selectedProduct.sku} • {selectedProduct.category}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">← Change</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Your Price</Label>
                <div className="h-10 px-3 flex items-center bg-slate-100 rounded-md border">
                  ₹{selectedProduct.retail_price?.toLocaleString()} / {selectedProduct.unit}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                placeholder="e.g., Purchased from local supplier"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending} className="flex-1 sm:flex-none">
                {addMutation.isPending ? 'Adding...' : `Add ${quantity || 0} Units`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
