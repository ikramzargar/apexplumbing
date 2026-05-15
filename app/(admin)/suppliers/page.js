'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { SupplierList } from '@/modules/suppliers/SupplierList';

export default function SuppliersPage() {
  return (
    <div>
    <div className="p-6 space-y-6">
        <PageHeader
          title="Supplier Management"
          subtitle="Manage your suppliers and manufacturers"
        />
        <SupplierList />
      </div>
    </div>
  );
}