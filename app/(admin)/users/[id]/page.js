'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetUser, useUpdateUser } from '@/hooks/useUsers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showSuccess, showApiError } from '@/utils/toast';

const USER_ROLES = ['admin', 'staff'];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const { data, isLoading } = useGetUser(userId);
  const updateUser = useUpdateUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const user = data?.data;

  if (isLoading) {
    return (
      <div className="p-6"><LoadingSpinner /></div>
    );
  }

  if (!form && user) {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = { ...form };
    if (newPassword) {
      userData.password = newPassword;
    }

    try {
      await updateUser.mutateAsync({ id: userId, data: userData });
      showSuccess('User updated successfully');
      if (newPassword) {
        router.push('/users');
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return null;

  return (
    <div>
      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        <PageHeader
          title={user?.name || 'User'}
          subtitle="Edit user details and permissions"
        />

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                  {loading ? 'Saving...' : 'Update User'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/users')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(user?.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}