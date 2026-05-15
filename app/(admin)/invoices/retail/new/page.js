'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProducts } from '@/lib/products.api';
import { createRetailInvoice, confirmInvoice, markAsPaid } from '@/lib/invoices.api';
import { formatCurrency } from '@/utils/formatCurrency';
import { showApiError, showError, showSuccess } from '@/utils/toast';
import { Plus, Trash2, ArrowLeft, Save, CheckCircle, Package, Search } from 'lucide-react';
import { PlumberSearchModal } from '@/modules/invoices/PlumberSearchModal';
import api from '@/lib/axios';

export default function NewRetailInvoicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedPlumber, setSelectedPlumber] = useState('');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [markAsPaidOption, setMarkAsPaidOption] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [showPlumberModal, setShowPlumberModal] = useState(false);
  const [selectedPlumberData, setSelectedPlumberData] = useState(null);

  // Customer phone search
  const [phoneSearch, setPhoneSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const customerSearchRef = useRef(null);

  const { data: productsData } = useQuery({
    queryKey: ['products-for-invoice'],
    queryFn: () => getProducts({ search: '', limit: 100 }),
  });

  const products = productsData?.data?.products || [];
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name || '');
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.address || '');
    setPaymentMethod(customer.last_payment_method || 'Cash');
    setPhoneSearch(customer.phone);
    setCustomerSuggestions([]);
    setShowCustomerSuggestions(false);
  };

  // Search customers by phone number
  useEffect(() => {
    if (phoneSearch.length < 3) {
      setCustomerSuggestions([]);
      setShowCustomerSuggestions(false);
      return;
    }

    setSearchingCustomers(true);
    const timer = setTimeout(async () => {
      try {
        const result = await api.get(`/customers?search=${encodeURIComponent(phoneSearch)}`);
        if (result.data.success) {
          setCustomerSuggestions(result.data.data || []);
          setShowCustomerSuggestions(true);
        }
      } catch (err) {
        console.error('Customer search error:', err);
      } finally {
        setSearchingCustomers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [phoneSearch]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!customerSearchRef.current?.contains(e.target)) {
        setShowCustomerSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price - (item.discount || 0)), 0);
  const total = subtotal;
  const balanceDue = total - amountPaid;

  const addItem = (product) => {
    const existing = items.find(item => item.product === product._id);
    if (existing) {
      setItems(items.map(item =>
        item.product === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, {
        product: product._id,
        product_name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_price: product.retail_price,
        discount: 0,
        max_stock: product.current_stock
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

  const handlePlumberSelect = (plumber) => {
    setSelectedPlumber(plumber._id);
    setSelectedPlumberData(plumber);
  };

  const handleRemovePlumber = () => {
    setSelectedPlumber('');
    setSelectedPlumberData(null);
  };

  const handleSubmit = async (confirm = false) => {
    if (items.length === 0) {
      showError('Please add at least one product');
      return;
    }

    if (!customerPhone.trim()) {
      showError('Please enter customer phone number');
      return;
    }

    const finalAmountPaid = markAsPaidOption ? total : amountPaid;

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone,
        customer_address: customerAddress,
        plumber_ref: selectedPlumber || undefined,
        items: items.map(item => ({
          product: item.product,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0
        })),
        payment_method: paymentMethod,
        amount_paid: finalAmountPaid
      };

      const result = await createRetailInvoice(payload);

      if (confirm) {
        await confirmInvoice(result.data._id);
        if (markAsPaidOption) {
          await markAsPaid(result.data._id);
          showSuccess('Invoice confirmed and marked as paid');
        } else {
          showSuccess('Invoice created and confirmed');
        }
      } else {
        showSuccess('Invoice saved as draft');
      }

      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      router.push(`/invoices/${result.data._id}`);
    } catch (err) {
      showApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Phone Number *</Label>
              <div className="relative" ref={customerSearchRef}>
                <div className="flex items-center">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] z-10" />
                  <Input
                    placeholder="Search by phone..."
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
                {phoneSearch.length >= 3 && showCustomerSuggestions && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchingCustomers ? (
                      <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">Searching...</div>
                    ) : customerSuggestions.length > 0 ? (
                      <>
                        <div className="p-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-surface-elevated)] bg-[var(--color-surface-elevated)]">
                          {customerSuggestions.length} customer{customerSuggestions.length !== 1 ? 's' : ''} found
                        </div>
                        {customerSuggestions.map((customer) => (
                          <div
                            key={customer._id}
                            className="px-4 py-3 cursor-pointer hover:bg-[var(--color-surface-elevated)] border-b border-[var(--color-surface-elevated)] last:border-0 transition-colors"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[var(--color-text-secondary)]">{customer.name || 'No name'}</span>
                              <span className="text-xs font-mono bg-[var(--color-surface-elevated)] px-2 py-1 rounded text-[var(--color-primary)]">
                                {customer.phone}
                              </span>
                            </div>
                            {customer.address && (
                              <p className="text-xs text-[var(--color-text-muted)] mt-1">{customer.address}</p>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">
                        No customers found for &quot;{phoneSearch}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                placeholder="Customer address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Referral Plumber</Label>
              {selectedPlumberData ? (
                <div className="flex items-center justify-between p-2 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">{selectedPlumberData.full_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {selectedPlumberData.phone} - {selectedPlumberData.district}
                      {selectedPlumberData.verification_status !== 'VERIFIED' && (
                        <span className="text-orange-500 ml-2">(Bonus will be held)</span>
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemovePlumber}>
                    x
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={() => setShowPlumberModal(true)}
                >
                  <Search size={16} className="mr-2" />
                  Search Plumber
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Products</CardTitle>
            <Button size="sm" onClick={() => setShowProductSelect(true)}>
              <Plus size={16} className="mr-1" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-[var(--color-text-muted)] mb-3" />
              <p className="text-[var(--color-text-muted)] mb-3">No products added yet</p>
              <Button variant="outline" onClick={() => setShowProductSelect(true)}>
                <Plus size={16} className="mr-1" /> Add Product
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-[var(--color-text-muted)] px-2">
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Discount</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="block md:hidden space-y-4">
                {items.map((item, index) => {
                  const isOverStock = item.quantity > item.max_stock;
                  return (
                    <div key={index} className={`p-4 rounded-lg ${isOverStock ? 'bg-orange-50 border border-orange-300' : 'bg-[var(--color-surface-elevated)]'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-[var(--color-text-secondary)]">{item.product_name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">SKU: {item.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className={`h-10 ${isOverStock ? 'border-orange-400 bg-orange-50' : ''}`}
                          />
                          <p className={`text-[10px] mt-0.5 ${isOverStock ? 'text-orange-600' : 'text-[var(--color-text-muted)]'}`}>
                            Stock: {item.max_stock}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Discount</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.discount || 0}
                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <p className="text-lg font-bold text-[var(--color-text-secondary)]">
                          {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block space-y-3">
                {items.map((item, index) => {
                  const isOverStock = item.quantity > item.max_stock;
                  return (
                    <div key={index} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${isOverStock ? 'bg-orange-50 border border-orange-300' : 'bg-[var(--color-surface-elevated)]'}`}>
                      <div className="col-span-4">
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] truncate">{item.product_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">SKU: {item.sku}</p>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          max={item.max_stock}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className={`text-right h-8 ${isOverStock ? 'border-orange-400 bg-orange-50' : ''}`}
                        />
                        <p className={`text-[10px] mt-0.5 ${isOverStock ? 'text-orange-600 font-medium' : 'text-[var(--color-text-muted)]'} text-right`}>
                          Stock: {item.max_stock}
                          {isOverStock && (
                            <span className="ml-1">Only {item.max_stock} available</span>
                          )}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-right h-8"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.discount || 0}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="text-right h-8"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                          {formatCurrency(item.quantity * item.unit_price - (item.discount || 0))}
                        </p>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount Paid</Label>
              <Input
                type="number"
                min="0"
                value={markAsPaidOption ? total : amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                disabled={markAsPaidOption}
                className={markAsPaidOption ? 'bg-[var(--color-surface-elevated)]' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Balance Due</Label>
              <div className="h-10 px-3 flex items-center bg-[var(--color-surface-elevated)] rounded-md border border-[var(--color-border)]">
                <span className="text-lg font-semibold text-[var(--color-text-secondary)]">{markAsPaidOption ? formatCurrency(0) : formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[var(--color-success)]/5 border border-[var(--color-success)]/20 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={markAsPaidOption}
                onChange={(e) => {
                  setMarkAsPaidOption(e.target.checked);
                  if (e.target.checked) {
                    setAmountPaid(total);
                  }
                }}
                className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-success)] focus:ring-[var(--color-success)]"
              />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Mark as Paid</p>
                <p className="text-xs text-[var(--color-text-muted)]">Invoice will be marked as fully paid ({formatCurrency(total)})</p>
              </div>
            </label>
          </div>

          <div className="mt-4 p-4 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Subtotal</span>
              <span className="text-lg font-semibold text-[var(--color-text-secondary)]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--color-border)]">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Total</span>
              <span className="text-xl font-bold text-[var(--color-primary)]">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center gap-3 sticky bottom-0 left-0 right-0 bg-white border-t p-4 md:static md:bg-transparent md:border-0">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={submitting || items.length === 0}
          className="w-full sm:w-auto"
        >
          <Save size={16} className="mr-1" /> Save Draft
        </Button>
        <Button
          onClick={() => handleSubmit(true)}
          disabled={submitting || items.length === 0}
          className={`w-full sm:w-auto ${markAsPaidOption ? 'bg-[var(--color-success)] hover:bg-[var(--color-success)]' : ''}`}
        >
          <CheckCircle size={16} className="mr-1" /> {markAsPaidOption ? 'Confirm & Pay' : 'Confirm'}
        </Button>
      </div>

      {showProductSelect && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Product</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowProductSelect(false)}>
                  x
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-[var(--color-text-muted)] py-4">No products found</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] cursor-pointer transition-colors"
                      onClick={() => addItem(product)}
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{product.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">SKU: {product.sku} | Stock: {product.current_stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-primary)]">{formatCurrency(product.retail_price)}</p>
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

      <PlumberSearchModal
        isOpen={showPlumberModal}
        onClose={() => setShowPlumberModal(false)}
        onSelect={handlePlumberSelect}
      />
    </div>
  );
}