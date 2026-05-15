'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  VERIFIED: { variant: 'success', label: 'Verified' },
  PENDING: { variant: 'warning', label: 'Pending' },
  REJECTED: { variant: 'destructive', label: 'Rejected' },
  PAID: { variant: 'success', label: 'Paid' },
  PARTIAL: { variant: 'info', label: 'Partial' },
  UNPAID: { variant: 'danger', label: 'Unpaid' },
  CONFIRMED: { variant: 'success', label: 'Confirmed' },
  DRAFT: { variant: 'secondary', label: 'Draft' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  ELIGIBLE: { variant: 'success', label: 'Eligible' },
  HELD: { variant: 'warning', label: 'Held' },
  APPROVED: { variant: 'success', label: 'Approved' },
  RETAIL: { variant: 'primary', label: 'Retail' },
  WHOLESALE: { variant: 'secondary', label: 'Wholesale' },
  superadmin: { variant: 'primary', label: 'Super Admin' },
  admin: { variant: 'secondary', label: 'Admin' },
  staff: { variant: 'outline', label: 'Staff' },
  distributor: { variant: 'secondary', label: 'Distributor' },
  OK: { variant: 'success', label: 'OK' },
  LOW: { variant: 'warning', label: 'Low' },
  OUT: { variant: 'destructive', label: 'Out' },
};

export function StatusBadge({ status, className, variants }) {
  const defaults = statusConfig[status] || { variant: 'outline', label: status };
  const config = variants?.[status] || defaults;

  return (
    <Badge variant={config.variant} className={cn('capitalize font-semibold text-xs px-2.5 py-0.5', className)}>
      {config.label}
    </Badge>
  );
}