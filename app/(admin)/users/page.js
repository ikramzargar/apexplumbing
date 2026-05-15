'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetUsers, useDeactivateUser, useReactivateUser } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { showApiError } from '@/utils/toast';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const USER_ROLES = ['superadmin', 'admin', 'staff', 'distributor'];

export default function UsersPage() {
  const [filters, setFilters] = useState({ search: '', role: 'all' });
  const { data, isLoading, error, refetch } = useGetUsers(filters);
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();
  const [confirmDialog, setConfirmDialog] = useState(null);
  const { user } = useAuth();
  console.log('Current User:', user);
  console.log('API Response:', data, 'Error:', error);
  const users = data?.data?.users || [];

  const filteredUsers = users.filter((u) => {
    const matchesSearch = filters.search === '' ||
      u.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      u.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || u.role === filters.role;
    return matchesSearch && matchesRole;
  });

  const handleDeactivate = async () => {
    if (!confirmDialog) return;
    try {
      await deactivateUser.mutateAsync(confirmDialog.userId);
    } catch (error) {
      showApiError(error);
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await reactivateUser.mutateAsync(userId);
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
        <PageHeader
          title="User Management"
          subtitle="Manage admin users and their permissions"
          actionLabel="Add User"
          actionHref="/users/new"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.role}
                onValueChange={(val) => setFilters({ ...filters, role: val })}
              >
                <SelectTrigger className="w-full sm:w-40 h-11">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12 px-4">
                <p className="text-red-600 mb-2 font-medium">Failed to load users</p>
                <p className="text-sm text-red-500">{error.displayMessage || error.response?.data?.message || error.message}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground mb-4">No users found</p>
                <Link href="/users/new">
                  <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Add User</Button>
                </Link>
              </div>
            ) : (
              <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id || user._id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'distributor' ? 'bg-cyan-100 text-cyan-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/users/${user._id}`}>
                              <Button size="sm" variant="ghost">Edit</Button>
                            </Link>
                            {user.is_active && user.role !== 'superadmin' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setConfirmDialog({ userId: user._id, userName: user.name })}
                              >
                                Deactivate
                              </Button>
                            )}
                            {!user.is_active && user.role !== 'superadmin' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleReactivate(user._id)}
                              >
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-[var(--color-border)]">
                {filteredUsers.map((user) => (
                  <div key={user.id || user._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--color-navy)]">{user.name}</p>
                        <p className="text-xs text-[var(--color-body-light)]">{user.email}</p>
                      </div>
                      {user.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'distributor' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-[var(--color-body-light)]">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/users/${user._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">Edit</Button>
                      </Link>
                      {user.is_active && user.role !== 'superadmin' && (
                        <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 border-red-200"
                          onClick={() => setConfirmDialog({ userId: user._id, userName: user.name })}
                        >
                          Deactivate
                        </Button>
                      )}
                      {!user.is_active && user.role !== 'superadmin' && (
                        <Button
                        size="sm"
                          variant="outline"
                          className="flex-1 text-green-600 hover:text-green-700 border-green-200"
                          onClick={() => handleReactivate(user._id)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        onOpenChange={() => setConfirmDialog(null)}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${confirmDialog?.userName}? They will no longer be able to log in.`}
        onConfirm={handleDeactivate}
        confirmLabel="Deactivate"
        />
        </>
  
  );
}