'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetProduct, useUpdateProduct, useDeactivateProduct } from '@/hooks/useProducts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showSuccess, showApiError } from '@/utils/toast';
import { PRODUCT_CATEGORIES, UNITS } from '@/utils/constants';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const { data, isLoading } = useGetProduct(productId);
  const updateProduct = useUpdateProduct();
  const deactivateProduct = useDeactivateProduct();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="p-6"><LoadingSpinner /></div>
    );
  }

  if (!form && product) {
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      cost_price: product.cost_price,
      low_stock_threshold: product.low_stock_threshold,
    });
  }

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
      low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
    };

    try {
      await updateProduct.mutateAsync({ id: productId, data: productData });
      router.push('/products');
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateProduct.mutateAsync(productId);
      showSuccess('Product deactivated');
    } catch (error) {
      showApiError(error);
    }
  };

  if (!form) return null;

  return (
    <div>
      <div className="p-4 md:p-6 max-w-2xl">
        <PageHeader
          title={product?.name || 'Product'}
          subtitle="Edit product details"
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
                  <Input id="sku" name="sku" value={form.sku} onChange={handleChange} required disabled />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                  <Input id="low_stock_threshold" name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} />
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
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                  {loading ? 'Saving...' : 'Update Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/products')}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={handleDeactivate}>
                  {product?.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}