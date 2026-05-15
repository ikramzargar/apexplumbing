'use client';

import { cn } from '@/lib/utils';

export function PageHeader({ title, subtitle, actionLabel, actionHref, onAction, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-secondary)] tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        {children}
        {(actionLabel && (actionHref || onAction)) && (
          actionHref ? (
            <a href={actionHref}>
              <button className="inline-flex items-center justify-center h-11 w-full sm:w-auto px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm shadow-[var(--color-primary)]/20">
                {actionLabel}
              </button>
            </a>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center h-11 w-full sm:w-auto px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm shadow-[var(--color-primary)]/20"
            >
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}