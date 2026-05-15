'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetDistributors } from '@/hooks/useDistributors';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { JK_DISTRICTS } from '@/utils/constants';
import { Plus, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DistributorsPage() {
  const [filters, setFilters] = useState({ search: '', district: 'all' });
  const { data, isLoading } = useGetDistributors();
  const distributors = data?.data || [];

  const filteredDistributors = distributors.filter((d) => {
    const matchesSearch = filters.search === '' ||
      d.business_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      d.phone?.includes(filters.search);
    const matchesDistrict = filters.district === 'all' || d.district === filters.district;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
        <PageHeader
          title="Distributors"
          subtitle="Manage distributor accounts"
          actionLabel="Add Distributor"
          actionHref="/distributors/new"
        />

        <Card className="shadow-sm">
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-body-light)]" />
                <Input
                  placeholder="Search by name or phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 h-10"
                />
              </div>
              <Select
                value={filters.district}
                onValueChange={(val) => setFilters({ ...filters, district: val })}
              >
                <SelectTrigger className="w-full sm:w-52 h-11">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {JK_DISTRICTS.map((dist) => (
                    <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredDistributors.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-subtle)] flex items-center justify-center mx-auto mb-4">
                  <Building2 size={28} className="text-[var(--color-body-light)]" />
                </div>
                <p className="text-[var(--color-body-light)] mb-4">No distributors found</p>
                <Link href="/distributors/new">
                  <Button className="w-full sm:w-auto shadow-sm shadow-[var(--color-primary)]/[0.2]"><Plus className="w-4 h-4 mr-2" />Add Distributor</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Business Name</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Owner</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Phone</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">District</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Credit Limit</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4 text-right">Balance</TableHead>
                    <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistributors.map((dist) => (
                    <TableRow key={dist._id} className="group hover:bg-[var(--color-bg-subtle)] transition-colors duration-150 border-b border-[var(--color-border)] last:border-0">
                      <TableCell className="font-semibold text-[var(--color-navy)]">{dist.business_name}</TableCell>
                      <TableCell className="text-[var(--color-body)]">{dist.owner_name}</TableCell>
                      <TableCell className="font-mono text-sm text-[var(--color-body)]">{dist.phone}</TableCell>
                      <TableCell><StatusBadge status="distributor" /></TableCell>
                      <TableCell className="text-right font-semibold text-[var(--color-navy)]">{formatCurrency(dist.credit_limit || 0)}</TableCell>
                      <TableCell className={`text-right font-bold ${(dist.balance || 0) > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                        {formatCurrency(dist.balance || 0)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/distributors/${dist._id}`}>
                          <Button size="sm" variant="ghost" className="text-[var(--color-body)] group-hover:text-[var(--color-primary)] transition-colors">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}