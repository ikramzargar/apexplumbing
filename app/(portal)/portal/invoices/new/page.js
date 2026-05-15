'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showApiError, showError } from '@/utils/toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { getProducts } from '@/lib/products.api';
import { getPlumbers } from '@/lib/plumbers.api';
import { createPortalInvoice } from '@/lib/portal.api';
import { getMyInventory } from '@/lib/stockRequest.api';
import { CustomerSearch } from '@/modules/shared/CustomerSearch';
import { Plus, Trash2, ArrowLeft, Package, Search, AlertTriangle } from 'lucide-react';

export default function NewPortalInvoice() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPlumber, setSelectedPlumber] = useState('');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name || '');
    setCustomerPhone(customer.phone || '');
    setPaymentMethod(customer.last_payment_method || 'Cash');
  };

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-invoice'],
    queryFn: () => getProducts({ search: '', limit: 100 }),
  });

  const { data: plumbersData, isLoading: plumbersLoading } = useQuery({
    queryKey: ['verified-plumbers'],
    queryFn: () => getPlumbers({ status: 'VERIFIED', limit: 100 }),
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['distributor-inventory'],
    queryFn: getMyInventory,
  });

  const products = productsData?.data?.products || [];
  const plumbers = plumbersData?.data?.plumbers || [];
  const inventory = inventoryData?.data || [];
  const loading = productsLoading || plumbersLoading;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getInventoryStock = (productId) => {
    const invItem = inventory.find(i => i.product?._id === productId || i.product === productId);
    return invItem?.quantity || 0;
  };

  const inventoryProducts = filteredProducts.filter(p => getInventoryStock(p._id) > 0);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount || 0)), 0);
  const balanceDue = subtotal - amountPaid;

  const addItem = (product) => {
    const invStock = getInventoryStock(product._id);
    if (invStock === 0) {
      showError('This product is not in your inventory. Please request stock from admin.');
      return;
    }

    const existing = items.find(item => item.product === product._id);
    if (existing) {
      const newQty = existing.quantity + 1;
      if (newQty > invStock) {
        showError(`Only ${invStock} units available in your inventory.`);
        return;
      }
      setItems(items.map(item =>
        item.product === product._id ? { ...item, quantity: newQty } : item
      ));
    } else {
      setItems([...items, {
        product: product._id,
        product_name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_price: product.wholesale_price || product.mrp,
        discount: 0,
        max_stock: invStock
      }]);
    }
    setShowProductSelect(false);
    setSearch('');
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
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
      const result = await createPortalInvoice({
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone,
        plumber_ref: selectedPlumber || undefined,
        items: items.map(item => ({
          product: item.product,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0
        })),
        payment_method: paymentMethod,
        amount_paid: amountPaid
      });

      queryClient.invalidateQueries({ queryKey: ['portal-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-inventory'] });
      showSuccess('Invoice created and confirmed successfully');
      router.push(`/portal/invoices/${result.data._id}`);
    } catch (err) {
      showApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 px-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/portal/invoices')}>
          <ArrowLeft size={14} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[#061b31]">New Invoice</h1>
          <p className="text-xs text-[#64748d]">Create a new invoice for your customer</p>
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
              <Input placeholder="Enter phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Referral Plumber</Label>
              <Select value={selectedPlumber} onValueChange={setSelectedPlumber}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select plumber (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {plumbers.map(p => (
                    <SelectItem key={p._id} value={p._id}>{p.full_name} - {p.referral_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Package size={40} className="mx-auto text-[#94a3b8] mb-3" />
              <p className="text-[#64748d] mb-3">No products added yet</p>
              <Button variant="outline" onClick={() => setShowProductSelect(true)}>
                <Plus size={14} className="mr-1" /> Add Product
              </Button>
            </div>
          ) : (
            <div>
              {/* Mobile: stacked product cards */}
              <div className="block md:hidden space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-[#f8fafc] rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-[#061b31]">{item.product_name}</p>
                      <p className="text-xs text-[#94a3b8]">SKU: {item.sku}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="h-10" />
                      <p className="text-[10px] text-[#94a3b8] mt-0.5">Stock: {item.max_stock}</p>
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
                    <p className="text-lg font-bold text-[#061b31]">
                      {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: grid layout */}
            <div className="hidden md:block space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-[#64748d] px-2">
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Discount</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-[#f8fafc] rounded-lg">
                  <div className="col-span-4">
                    <p className="text-xs font-medium text-[#061b31] truncate">{item.product_name}</p>
                    <p className="text-[10px] text-[#94a3b8]">SKU: {item.sku}</p>
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
                    <p className="text-xs font-semibold text-[#061b31]">
                      {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </div>
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
              <div className="h-10 px-3 flex items-center bg-[#f8fafc] rounded-md border border-[#e8edf5]">
                <span className="text-lg font-semibold text-[#061b31]">{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-[#f8fafc] rounded-lg border border-[#e8edf5]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#061b31]">Total</span>
              <span className="text-xl font-bold text-[#533afd]">{formatCurrency(subtotal)}</span>
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
                <CardTitle>Select Product</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowProductSelect(false)}>✕</Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" autoFocus />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {inventoryProducts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle size={40} className="mx-auto text-[var(--color-warning)] mb-3" />
                  <p className="text-[#64748d] mb-2">No products in your inventory</p>
                  <p className="text-xs text-[#94a3b8]">Request stock from admin to create invoices</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inventoryProducts.map((product) => {
                    const invStock = getInventoryStock(product._id);
                    return (
                      <div key={product._id} className="flex items-center justify-between p-3 rounded-lg border border-[#e8edf5] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                        onClick={() => addItem(product)}>
                        <div>
                          <p className="text-sm font-medium text-[#061b31]">{product.name}</p>
                          <p className="text-xs text-[#64748d]">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#533afd]">{formatCurrency(product.wholesale_price || product.mrp)}</p>
                          <p className="text-xs text-[#94a3b8]">In stock: {invStock}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}