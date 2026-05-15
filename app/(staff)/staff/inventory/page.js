'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyInventory } from '@/lib/staffInventory.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StaffAddInventoryDialog } from '@/modules/staff-inventory/StaffAddInventoryDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StaffInventoryPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['my-inventory'],
    queryFn: getMyInventory
  });

  const totalItems = data?.length || 0;
  const lowStockCount = data?.filter(i => i.status === 'LOW').length || 0;
  const outOfStockCount = data?.filter(i => i.status === 'OUT').length || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="My Inventory"
          description="Your personal stock"
        />
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Inventory
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Products</p>
                <p className="text-2xl font-bold mt-1">{totalItems}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Package size={20} className="text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Low Stock</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{lowStockCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Package size={20} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Out of Stock</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{outOfStockCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Package size={20} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No items in your inventory</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Inventory" to add products</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.product_sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={item.status}
                        variants={{ OK: 'success', LOW: 'warning', OUT: 'destructive' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StaffAddInventoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}