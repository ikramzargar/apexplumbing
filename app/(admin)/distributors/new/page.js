'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDistributor } from '@/hooks/useDistributors';
import { showApiError } from '@/utils/toast';
import { JK_DISTRICTS } from '@/utils/constants';

export default function NewDistributorPage() {
  const router = useRouter();
  const createDistributor = useCreateDistributor();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    address: '',
    district: '',
    gstin: '',
    credit_limit: '0',
  });

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
      await createDistributor.mutateAsync(distributorData);
      router.push('/distributors');
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <div className="p-4 md:p-6 max-w-2xl">
        <PageHeader
          title="Add New Distributor"
          subtitle="Add a distributor to your network"
        />
        <Card>
          <CardContent className="pt-6">
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
                  <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91-XXXXX-XXXXX" />
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
              <Button type="submit" disabled={loading} className="mt-4 w-full sm:w-auto">
                {loading ? 'Saving...' : 'Add Distributor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}