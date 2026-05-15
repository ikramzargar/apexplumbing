'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateProduct } from '@/hooks/useProducts';
import { showApiError } from '@/utils/toast';
import { PRODUCT_CATEGORIES, UNITS } from '@/utils/constants';

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: 'pieces',
    retail_price: '',
    wholesale_price: '',
    cost_price: '',
    current_stock: '0',
    low_stock_threshold: '10',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      ...form,
      retail_price: parseFloat(form.retail_price),
      wholesale_price: parseFloat(form.wholesale_price),
      cost_price: parseFloat(form.cost_price),
      current_stock: parseInt(form.current_stock) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
    };

    try {
      await createProduct.mutateAsync(productData);
      router.push('/products');
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <div className="p-4 md:p-6 max-w-2xl">
        <PageHeader
          title="Add New Product"
          subtitle="Add a product to your catalog"
        />
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" name="sku" value={form.sku} onChange={handleChange} required placeholder="TANK-001" />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={form.unit} onValueChange={(val) => setForm({ ...form, unit: val })}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retail_price">Retail Price *</Label>
                  <Input id="retail_price" name="retail_price" type="number" value={form.retail_price} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="wholesale_price">Wholesale Price *</Label>
                  <Input id="wholesale_price" name="wholesale_price" type="number" value={form.wholesale_price} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="cost_price">Cost Price *</Label>
                  <Input id="cost_price" name="cost_price" type="number" value={form.cost_price} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="current_stock">Initial Stock</Label>
                  <Input id="current_stock" name="current_stock" type="number" value={form.current_stock} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                  <Input id="low_stock_threshold" name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="mt-4 w-full sm:w-auto">
                {loading ? 'Saving...' : 'Add Product'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}