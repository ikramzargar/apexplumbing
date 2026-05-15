'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-[var(--color-text-muted)] ${className || ''}`}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={40} />
        <span className="text-xs text-[var(--color-text-muted)]">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 animate-pulse">
      <div className="h-4 bg-[var(--color-surface-elevated)] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[var(--color-surface-elevated)] rounded w-1/2" />
    </div>
  );
}