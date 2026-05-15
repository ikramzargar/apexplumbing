'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { Eye, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PlumberTable({ data, onEdit, onDelete }) {
  const router = useRouter();
  const { isAdmin, isSuperAdmin } = useAuth();
  const plumbers = data?.plumbers || [];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden shadow-sm">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
              <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Name</TableHead>
              <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">District</TableHead>
              <TableHead className="text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold text-[var(--color-body)] uppercase tracking-wider py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plumbers.map((plumber) => (
              <TableRow
                key={plumber._id}
                className="cursor-pointer group hover:bg-[var(--color-primary-light)] transition-colors duration-150 border-b border-[var(--color-border)] last:border-0"
                onClick={() => router.push(`/plumbers/${plumber._id}`)}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    {plumber.photo_url ? (
                      <img src={plumber.photo_url} alt={plumber.full_name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-sm font-bold text-white shadow-sm shadow-[var(--color-primary)]/20">
                        {plumber.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-[var(--color-navy)]">{plumber.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[var(--color-body)] font-mono text-sm">{plumber.phone}</TableCell>
                <TableCell className="text-[var(--color-body)]">{plumber.district}</TableCell>
                <TableCell>
                  <StatusBadge status={plumber.verification_status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Button size="icon-sm" variant="ghost" onClick={() => router.push(`/plumbers/${plumber._id}`)} className="text-[var(--color-body)] hover:text-[var(--color-navy)] hover:bg-[var(--color-bg-subtle)]">
                      <Eye size={16} />
                    </Button>
                    {onEdit && (
                      <Button size="icon-sm" variant="ghost" onClick={() => onEdit(plumber)} className="text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
                        <Pencil size={16} />
                      </Button>
                    )}
                    {(isSuperAdmin || isAdmin) && plumber.verification_status === 'PENDING' && (
                      <Button size="icon-sm" variant="ghost" className="text-[var(--color-success)] hover:text-[#13a94a] hover:bg-[var(--color-success-bg)]">
                        <CheckCircle size={16} />
                      </Button>
                    )}
                    {onDelete && (isSuperAdmin || isAdmin) && (
                      <Button size="icon-sm" variant="ghost" onClick={() => onDelete(plumber)} className="text-[var(--color-body)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]">
                        <Trash2 size={16} />
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
        {plumbers.map((plumber) => (
          <div
            key={plumber._id}
            className="p-4 cursor-pointer hover:bg-[var(--color-primary-light)]/30 transition-colors"
            onClick={() => router.push(`/plumbers/${plumber._id}`)}
          >
            <div className="flex items-start gap-3 mb-3">
              {plumber.photo_url ? (
                <img src={plumber.photo_url} alt={plumber.full_name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-sm font-bold text-white shadow-sm shadow-[var(--color-primary)]/20">
                  {plumber.full_name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-navy)]">{plumber.full_name}</p>
                <p className="text-sm text-[var(--color-body-light)] font-mono">{plumber.phone}</p>
                <p className="text-xs text-[var(--color-body-light)] mt-0.5">{plumber.district}</p>
              </div>
              <StatusBadge status={plumber.verification_status} />
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/plumbers/${plumber._id}`)}>
                <Eye size={14} className="mr-1" /> View
              </Button>
              {onEdit && (
                <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(plumber)}>
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>
              )}
              {onDelete && (isSuperAdmin || isAdmin) && (
                <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200" onClick={() => onDelete(plumber)}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}