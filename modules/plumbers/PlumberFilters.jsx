'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JK_DISTRICTS } from '@/utils/constants';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PlumberFilters({ filters, onFilter }) {
  const handleChange = (key, value) => {
    onFilter({ ...filters, [key]: value, page: 1 });
  };

  const hasFilters = filters.search || filters.district !== 'all' || filters.verification_status !== 'all';

  const clearFilters = () => {
    onFilter({ search: '', district: 'all', verification_status: 'all', page: 1 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <div className="relative flex-1 w-full sm:max-w-[200px]">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-body-light)]" />
        <Input
          placeholder="Search plumbers..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="pl-10 pr-10 h-11"
        />
      </div>
      <Select value={filters.district || 'all'} onValueChange={(val) => handleChange('district', val)}>
        <SelectTrigger className="w-full sm:w-[160px] h-11">
          <SelectValue placeholder="All Districts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Districts</SelectItem>
          {JK_DISTRICTS.map((district) => (
            <SelectItem key={district} value={district}>{district}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.verification_status || 'all'} onValueChange={(val) => handleChange('verification_status', val)}>
        <SelectTrigger className="w-full sm:w-[140px] h-11">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="VERIFIED">Verified</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[var(--color-body)] hover:text-[var(--color-danger)] h-11 px-3 w-full sm:w-auto">
          <X size={16} className="mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}