'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { showSuccess, showApiError, showError } from '@/utils/toast';

export function SupplierForm({ supplier, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    gstin: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!supplier;

  useEffect(() => {
    if (supplier) {
      setForm({
        business_name: supplier.business_name || '',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        district: supplier.district || '',
        gstin: supplier.gstin || '',
        notes: supplier.notes || ''
      });
    }
  }, [supplier]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name.trim()) {
      showError('Business name is required');
      return;
    }
    if (!form.phone.trim()) {
      showError('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const { updateSupplier } = await import('@/lib/suppliers.api');
        await updateSupplier(supplier._id, form);
        showSuccess('Supplier updated successfully');
      } else {
        const { createSupplier } = await import('@/lib/suppliers.api');
        await createSupplier(form);
        showSuccess('Supplier created successfully');
      }
      onSuccess?.();
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Business Name *</Label>
          <Input
            placeholder="ABC Supplies"
            value={form.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Contact Name</Label>
          <Input
            placeholder="Contact person name"
            value={form.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Phone Number *</Label>
          <Input
            placeholder="+91 XXXXXXXXXX"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="supplier@example.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Address</Label>
        <Input
          placeholder="Full address"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>District</Label>
          <Input
            placeholder="District"
            value={form.district}
            onChange={(e) => handleChange('district', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>GSTIN</Label>
          <Input
            placeholder="XXAAAA0000A1Z5"
            value={form.gstin}
            onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
            maxLength={15}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Input
          placeholder="Additional notes"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
          {loading ? 'Saving...' : isEdit ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
}