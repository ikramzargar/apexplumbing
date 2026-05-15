'use client';

import { useState } from 'react';
import { useGetActiveLocks, useReleaseLock, useReleaseAllLocks } from '@/hooks/useStockLock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from '@/utils/formatCurrency';
import { Lock, Trash2, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function StockLockManager() {
  const { isSuperAdmin } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, refetch } = useGetActiveLocks();
  const releaseLockMutation = useReleaseLock();
  const releaseAllMutation = useReleaseAllLocks();

  const locks = data?.locks || [];

  if (!isSuperAdmin) return null;
  if (locks.length === 0 && !isLoading) return null;

  const handleReleaseLock = (productId) => {
    releaseLockMutation.mutate(productId);
  };

  const handleReleaseAll = () => {
    releaseAllMutation.mutate();
  };

  return (
    <div className="border border-amber-200 bg-amber-50/50 rounded-lg overflow-hidden">
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-amber-100/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-amber-600" />
          <span className="text-sm font-medium text-amber-800">Active Stock Locks</span>
          <Badge variant="destructive" className="text-xs">{locks.length}</Badge>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => refetch()}
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </Button>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-amber-200 px-4 py-3 space-y-2">
          {locks.map((lock) => (
            <div key={lock._id} className="flex items-center justify-between py-1.5 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-medium text-[var(--color-navy)] truncate">{lock.product?.name}</span>
                <span className="text-xs text-[var(--color-body-light)]">{lock.locked_by?.name}</span>
                <Badge variant="outline" className="text-xs">{lock.operation}</Badge>
                <span className="text-xs text-[var(--color-body-light)]">
                  {formatDistanceToNow(new Date(lock.expires_at))} left
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[var(--color-body-light)] hover:text-[var(--color-danger)]"
                onClick={() => handleReleaseLock(lock.product._id)}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
          {locks.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-[var(--color-danger)] hover:text-[var(--color-danger)]"
              onClick={handleReleaseAll}
            >
              <Trash2 size={12} className="mr-1" /> Release All Locks
            </Button>
          )}
        </div>
      )}
    </div>
  );
}