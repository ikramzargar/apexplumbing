'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUser } from '@/hooks/useUsers';
import { showApiError, showSuccess } from '@/utils/toast';
import { JK_DISTRICTS } from '@/utils/constants';

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });

  // Distributor form state (shown when role is distributor)
  const [distributorForm, setDistributorForm] = useState({
    business_name: '',
    owner_name: '',
    district: '',
    gstin: '',
    address: '',
    credit_limit: '0',
  });

  // Roles based on user permission
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [
        { value: 'superadmin', label: 'Super Admin', desc: 'Full system access' },
        { value: 'admin', label: 'Admin', desc: 'Manage staff, inventory, invoices' },
        { value: 'staff', label: 'Staff', desc: 'Create invoices, manage own inventory' },
        { value: 'distributor', label: 'Distributor', desc: 'Access to distributor portal' },
      ];
    }
    if (isAdmin) {
      return [
        { value: 'staff', label: 'Staff', desc: 'Create invoices, manage own inventory' },
        { value: 'distributor', label: 'Distributor', desc: 'Access to distributor portal' },
      ];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleDistributorChange = (e) => {
    setDistributorForm({ ...distributorForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...userForm };

      // If creating a distributor, include distributor data
      if (userForm.role === 'distributor') {
        payload.distributor_data = { ...distributorForm };
        payload.distributor_data.credit_limit = parseFloat(distributorForm.credit_limit) || 0;
      }

      await createUser.mutateAsync(payload);
      showSuccess('User created successfully');
      router.push('/users');
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const getPageInfo = () => {
    if (isSuperAdmin) {
      return {
        title: 'Create User',
        subtitle: 'Create a new user with appropriate role'
      };
    }
    if (isAdmin) {
      return {
        title: 'Create Staff / Distributor',
        subtitle: 'Create a new staff member or distributor'
      };
    }
    return { title: 'Not Allowed', subtitle: 'You do not have permission to create users' };
  };

  const pageInfo = getPageInfo();
  const showDistributorFields = userForm.role === 'distributor';

  return (
    <div>
    <div className="p-4 md:p-6 max-w-3xl">
        <PageHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
        />

        {availableRoles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">You do not have permission to create users.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/users')}>
                Back to Users
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Details */}
                <div>
                  <h3 className="text-sm font-medium mb-4 text-muted-foreground">User Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={userForm.name}
                        onChange={handleUserChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userForm.email}
                        onChange={handleUserChange}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={userForm.phone}
                        onChange={handleUserChange}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={userForm.password}
                        onChange={handleUserChange}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={userForm.role}
                        onValueChange={(val) => setUserForm({ ...userForm, role: val })}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <span className="font-medium capitalize">{role.label}</span>
                                <span className="text-xs text-muted-foreground ml-2">- {role.desc}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Distributor Details (shown only when creating distributor) */}
                {showDistributorFields && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium mb-4 text-muted-foreground">Distributor Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name *</Label>
                        <Input
                          id="business_name"
                          name="business_name"
                          value={distributorForm.business_name}
                          onChange={handleDistributorChange}
                          placeholder="Company name"
                          required={showDistributorFields}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner_name">Owner Name *</Label>
                        <Input
                          id="owner_name"
                          name="owner_name"
                          value={distributorForm.owner_name}
                          onChange={handleDistributorChange}
                          placeholder="Owner full name"
                          required={showDistributorFields}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District *</Label>
                        <Select
                          value={distributorForm.district}
                          onValueChange={(val) => setDistributorForm({ ...distributorForm, district: val })}
                        >
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
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input
                          id="gstin"
                          name="gstin"
                          value={distributorForm.gstin}
                          onChange={handleDistributorChange}
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={distributorForm.address}
                          onChange={handleDistributorChange}
                          placeholder="Full address"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => router.push('/users')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !userForm.role || (showDistributorFields && !distributorForm.business_name)}>
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}