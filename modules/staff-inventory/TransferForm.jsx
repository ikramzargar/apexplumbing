import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStaffNames, getAllStaffInventories, transferToStaff } from '@/lib/staffInventory.api';
import { getProducts } from '@/lib/products.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function TransferForm({ open, onOpenChange, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    to_staff_id: '',
    product_id: '',
    quantity: '',
    note: ''
  });
  const [error, setError] = useState('');

  const { data: staffData } = useQuery({
    queryKey: ['staff-names'],
    queryFn: getStaffNames
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-for-transfer'],
    queryFn: () => getProducts({ limit: 500 })
  });

  const mutation = useMutation({
    mutationFn: transferToStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-staff-inventories'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      onSuccess?.();
      onOpenChange(false);
      setFormData({ to_staff_id: '', product_id: '', quantity: '', note: '' });
      setError('');
    },
    onError: (err) => {
      setError(err.message || 'Transfer failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      to_staff_id: formData.to_staff_id,
      product_id: formData.product_id,
      quantity: parseInt(formData.quantity),
      note: formData.note
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Stock to Staff</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Staff Member</Label>
            <Select
              value={formData.to_staff_id}
              onValueChange={(value) => setFormData({ ...formData, to_staff_id: value })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffData?.data?.map((staff) => (
                  <SelectItem key={staff._id} value={staff._id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {productsData?.products?.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note about this transfer"
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Transfer Stock
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}