'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pagination({ pagination, onPageChange, className = '' }) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className={`flex items-center justify-between pt-4 border-t ${className}`}>
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium">{total}</span> total
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className="hidden sm:flex"
        >
          <ChevronsLeft size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} />
        </Button>

        <div className="flex items-center gap-1 px-2">
          {getVisiblePages().map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => onPageChange(p)}
              className="w-8 h-8"
            >
              {p}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(pages)}
          className="hidden sm:flex"
        >
          <ChevronsRight size={14} />
        </Button>
      </div>
    </div>
  );
}