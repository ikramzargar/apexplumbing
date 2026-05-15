'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/products.api';
import { createStockRequest } from '@/lib/stockRequest.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewStockRequestPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [items, setItems] = useState([{ productId: '', requestedQuantity: 1 }]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data?.products || response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', requestedQuantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = items.filter((item) => item.productId && item.requestedQuantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one product to your request');
      return;
    }

    try {
      setSubmitting(true);
      await createStockRequest(validItems, note);
      router.push('/portal/stock-requests?success=true');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductPrice = (productId) => {
    const product = products.find((p) => p._id === productId);
    return product?.wholesale_price || 0;
  };

  const calculateLineTotal = (item) => {
    return getProductPrice(item.productId) * item.requestedQuantity;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--color-body)]" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-navy)]">Request Stock from Admin</h1>
          <p className="text-sm text-[var(--color-body-light)] mt-0.5">
            Submit a request and admin will approve stock for you
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-navy)]">Products</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
              <Plus size={14} />
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-start p-3 bg-[var(--color-bg-subtle)] rounded-lg"
              >
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-body-light)] mb-1 block">Product</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/[0.2]"
                  >
                    <option value="">Select product</option>
                    {filteredProducts.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku}) - {formatCurrency(product.wholesale_price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <label className="text-xs text-[var(--color-body-light)] mb-1 block">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.requestedQuantity}
                    onChange={(e) => updateItem(index, 'requestedQuantity', parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                </div>

                <div className="w-28">
                  <label className="text-xs text-[var(--color-body-light)] mb-1 block">Total</label>
                  <div className="px-3 py-2 text-sm font-medium text-[var(--color-navy)] bg-white border border-[var(--color-border)] rounded-lg text-right">
                    {formatCurrency(calculateLineTotal(item))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-6 p-1.5 text-[var(--color-body-light)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="flex justify-end mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-body)]">Estimated Total:</span>
              <span className="text-lg font-semibold text-[var(--color-navy)]">
                {formatCurrency(calculateGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
          <label className="text-sm font-semibold text-[var(--color-navy)] mb-2 block">
            Note to Admin (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any special instructions or reason for this request..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/[0.2] resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoadingSpinner size={16} />
                <span>Submitting...</span>
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}