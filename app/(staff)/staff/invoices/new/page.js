'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { getMyInventory, createStaffInvoice } from '@/lib/staffInventory.api';
import { showSuccess, showApiError, showError } from '@/utils/toast';
import { Plus, Trash2, ArrowLeft, Package, Search } from 'lucide-react';
import { CustomerSearch } from '@/modules/shared/CustomerSearch';

export default function NewStaffInvoice() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['my-inventory'],
    queryFn: getMyInventory
  });

  const inventory = inventoryData || [];
  const availableProducts = inventory.filter(item => item.quantity > 0);
  const filteredProducts = availableProducts.filter(p =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name || '');
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.address || '');
    setPaymentMethod(customer.last_payment_method || 'Cash');
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount || 0)), 0);
  const balanceDue = subtotal - amountPaid;

  const addItem = (product) => {
    const existing = items.find(item => item.product_id === product.product_id);
    if (existing) {
      const newQty = existing.quantity + 1;
      if (newQty > product.quantity) {
        showError(`Only ${product.quantity} units available`);
        return;
      }
      setItems(items.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: newQty }
          : item
      ));
    } else {
      setItems([...items, {
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.product_sku,
        quantity: 1,
        unit_price: product.mrp || 0,
        discount: 0,
        max_stock: product.quantity
      }]);
    }
    setShowProductSelect(false);
    setSearch('');
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];
    if (field === 'quantity') {
      if (value > item.max_stock) {
        showError(`Only ${item.max_stock} units available`);
        return;
      }
      if (value < 1) value = 1;
    }
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      showError('Please add at least one product');
      return;
    }
    if (!customerPhone.trim()) {
      showError('Please enter customer phone number');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createStaffInvoice({
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0
        })),
        payment_method: paymentMethod,
        amount_paid: amountPaid
      });

      queryClient.invalidateQueries({ queryKey: ['my-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
      showSuccess('Invoice created successfully');
      router.push(`/staff/invoices/${result.data._id}`);
    } catch (err) {
      showApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 px-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/staff/invoices')}>
          <ArrowLeft size={14} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-secondary)]">New Invoice</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Create invoice from your inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Customer Name</Label>
              <CustomerSearch
                onSelect={handleCustomerSelect}
                placeholder="Search by name..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number *</Label>
              <Input
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Address</Label>
              <Input
                placeholder="Customer address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Products</CardTitle>
            <Button size="sm" onClick={() => setShowProductSelect(true)}>
              <Plus size={14} className="mr-1" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package size={40} className="mx-auto text-[var(--color-text-muted)] mb-3" />
              <p className="text-[var(--color-text-muted)] mb-3">No products added yet</p>
              <Button variant="outline" onClick={() => setShowProductSelect(true)}>
                <Plus size={14} className="mr-1" /> Add from Inventory
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: stacked product cards */}
              <div className="block md:hidden space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-[var(--color-surface-elevated)] rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{item.product_name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">SKU: {item.sku}</p>
                      <p className="text-xs text-[var(--color-primary)]">Avail: {item.max_stock}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => removeItem(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" max={item.max_stock} value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="h-10" />
                    </div>
                    <div>
                      <Label className="text-xs">Price</Label>
                      <Input type="number" value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="h-10" />
                    </div>
                    <div>
                      <Label className="text-xs">Discount</Label>
                      <Input type="number" min="0" value={item.discount || 0}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)} className="h-10" />
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <p className="text-lg font-bold text-[var(--color-text-secondary)]">
                      {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: grid layout */}
            <div className="hidden md:block space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-[var(--color-text-muted)] px-2">
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Discount</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-[var(--color-surface-elevated)] rounded-lg">
                  <div className="col-span-4">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{item.product_name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">SKU: {item.sku}</p>
                    <p className="text-[10px] text-[var(--color-primary)]">Avail: {item.max_stock}</p>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="1" max={item.max_stock} value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="h-8 text-right" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="h-8 text-right" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="0" value={item.discount || 0}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)} className="h-8 text-right" />
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Payment Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount Paid</Label>
              <Input type="number" min="0" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Balance Due</Label>
              <div className="h-10 px-3 flex items-center bg-[var(--color-surface-elevated)] rounded-md border border-[var(--color-border)]">
                <span className="text-lg font-semibold text-[var(--color-text-secondary)]">{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Total</span>
              <span className="text-xl font-bold text-[var(--color-primary)]">{formatCurrency(subtotal)}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            <Button onClick={handleSubmit} disabled={submitting || items.length === 0}>
              {submitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showProductSelect && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select from Inventory</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowProductSelect(false)}>✕</Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" autoFocus />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[var(--color-text-muted)]">No products available in your inventory</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Contact admin to add stock</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] cursor-pointer transition-colors"
                      onClick={() => addItem(product)}>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{product.product_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">SKU: {product.product_sku}</p>
                        <p className="text-xs text-[var(--color-primary)]">Available: {product.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-primary)]">{formatCurrency(product.mrp || 0)}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">per unit</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}