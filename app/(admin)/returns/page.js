'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { showSuccess, showApiError, showError } from '@/utils/toast';
import { getReturns, approveReturn as approveReturnApi, rejectReturn as rejectReturnApi } from '@/lib/returns.api';
import { getInvoices } from '@/lib/invoices.api';
import { getProducts } from '@/lib/products.api';
import { Plus, CheckCircle, XCircle, FileText, RotateCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ReturnsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState({ return_type: 'all', status: 'all' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['returns', filter],
    queryFn: () => getReturns(filter),
  });

  const returns = data?.data?.returns || [];
  const pagination = data?.data?.pagination || {};

  const handleApprove = async (id) => {
    try {
      await approveReturnApi(id);
      showSuccess('Return approved. Stock has been restored.');
      refetch();
    } catch (err) {
      showApiError(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReturnApi(id);
      showSuccess('Return rejected.');
      refetch();
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <div>
      <div className="p-6 space-y-6">
        <PageHeader title="Stock Returns" subtitle="Manage sales and supplier returns">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />New Return</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Sales Return</DialogTitle>
              </DialogHeader>
              <SalesReturnForm
                onSuccess={() => {
                  setCreateDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Select
                value={filter.return_type}
                onValueChange={(val) => setFilter({ ...filter, return_type: val })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Return type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SALES">Sales Return</SelectItem>
                  <SelectItem value="SUPPLIER">Supplier Return</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.status}
                onValueChange={(val) => setFilter({ ...filter, status: val })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Returns Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : returns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No returns found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((ret) => (
                    <TableRow key={ret._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <FileText size={14} className="text-muted-foreground" />
                          {ret.credit_note_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ret.return_type === 'SALES'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {ret.return_type}
                        </span>
                      </TableCell>
                      <TableCell>{ret.items?.length || 0} items</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(ret.subtotal)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ret.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          ret.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          ret.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ret.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{ret.created_by?.name}</TableCell>
                      <TableCell className="text-right">
                        {ret.status === 'PENDING' && (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(ret._id)}
                            >
                              <CheckCircle size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(ret._id)}
                            >
                              <XCircle size={14} />
                            </Button>
                          </div>
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
    </div>
  );
}

function SalesReturnForm({ onSuccess, onCancel }) {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices-for-return'],
    queryFn: () => getInvoices({ status: 'CONFIRMED', limit: 50 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-for-return'],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const invoices = invoicesData?.data?.invoices || [];
  const products = productsData?.data?.products || [];

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    inv.customer_name?.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice._id);
    setInvoiceItems(invoice.items || []);
    setReturnItems(invoice.items?.map(item => ({
      product_id: item.product?._id,
      product_name: item.product_name || item.product?.name,
      quantity: 0,
      max_qty: item.quantity,
      unit_price: item.unit_price,
      reason: 'CUSTOMER_RETURN'
    })) || []);
  };

  const updateReturnItem = (index, field, value) => {
    setReturnItems(items => items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    const itemsToReturn = returnItems.filter(item => item.quantity > 0);
    if (itemsToReturn.length === 0) {
      showError('Select at least one item to return');
      return;
    }

    setLoading(true);
    try {
      const { createSalesReturn } = await import('@/lib/returns.api');
      await createSalesReturn({
        invoice_id: selectedInvoice,
        items: itemsToReturn
      });
      showSuccess('Return created. Credit note generated.');
      onSuccess?.();
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedInvoice ? (
        <>
          <div className="space-y-1.5">
            <Label>Select Invoice</Label>
            <Input
              placeholder="Search by invoice number or customer..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredInvoices.map(invoice => (
              <div
                key={invoice._id}
                className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => handleSelectInvoice(invoice)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{invoice.invoice_number}</span>
                  <span className="text-sm text-muted-foreground">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.customer_name} • {invoice.items?.length || 0} items
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">Invoice: {selectedInvoice}</p>
              <p className="text-sm text-muted-foreground">
                {invoiceItems.length} items available for return
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice('')}>
              Change
            </Button>
          </div>

          <div className="space-y-3">
            {returnItems.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Max: {item.max_qty}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={item.max_qty}
                    value={item.quantity}
                    onChange={(e) => updateReturnItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-24"
                    placeholder="Qty"
                  />
                  <Select
                    value={item.reason}
                    onValueChange={(val) => updateReturnItem(index, 'reason', val)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFECTIVE">Defective</SelectItem>
                      <SelectItem value="WRONG_ITEM">Wrong Item</SelectItem>
                      <SelectItem value="EXCESS_QUANTITY">Excess Quantity</SelectItem>
                      <SelectItem value="CUSTOMER_RETURN">Customer Return</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Return'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}