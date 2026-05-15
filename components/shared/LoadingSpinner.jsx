'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-[#64748d] ${className || ''}`}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={40} />
        <span className="text-xs text-[#64748d]">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border border-[#e8edf5] bg-white p-6 animate-pulse">
      <div className="h-4 bg-[#f1f5f9] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[#f1f5f9] rounded w-1/2" />
    </div>
  );
}