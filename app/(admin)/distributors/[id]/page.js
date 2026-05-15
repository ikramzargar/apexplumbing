'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetDistributor, useUpdateDistributor } from '@/hooks/useDistributors';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showSuccess, showApiError } from '@/utils/toast';
import { JK_DISTRICTS } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatCurrency';

export default function DistributorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const distributorId = params.id;
  const { data, isLoading } = useGetDistributor(distributorId);
  const updateDistributor = useUpdateDistributor();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  const distributor = data?.data;

  if (isLoading) {
    return (
      <div className="p-6"><LoadingSpinner /></div>
    );
  }

  if (!form && distributor) {
    setForm({
      business_name: distributor.business_name,
      owner_name: distributor.owner_name,
      phone: distributor.phone,
      address: distributor.address,
      district: distributor.district,
      gstin: distributor.gstin,
      credit_limit: distributor.credit_limit,
    });
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const distributorData = {
      ...form,
      credit_limit: parseFloat(form.credit_limit) || 0,
    };

    try {
      await updateDistributor.mutateAsync({ id: distributorId, data: distributorData });
      showSuccess('Distributor updated successfully');
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return null;

  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-6">
        <PageHeader
          title={distributor?.business_name || 'Distributor'}
          subtitle="Edit distributor details"
        />

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input id="business_name" name="business_name" value={form.business_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input id="owner_name" name="owner_name" value={form.owner_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" name="gstin" value={form.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Select value={form.district} onValueChange={(val) => setForm({ ...form, district: val })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {JK_DISTRICTS.map((dist) => (
                        <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input id="credit_limit" name="credit_limit" type="number" value={form.credit_limit} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Full address" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                  {loading ? 'Saving...' : 'Update Distributor'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/distributors')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Credit Limit</p>
                <p className="text-xl font-bold">{formatCurrency(distributor?.credit_limit || 0)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold">{formatCurrency(distributor?.balance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}