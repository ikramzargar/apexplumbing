'use client';

import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ icon: Icon = Package, title, description, actionLabel, actionHref, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-2xl flex items-center justify-center mb-5 border border-[var(--color-border)] shadow-sm">
        <Icon size={26} className="text-[var(--color-body-light)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-navy)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--color-body-light)] max-w-sm mb-6 leading-relaxed">{description}</p>}
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Button asChild className="shadow-sm shadow-[var(--color-primary)]/20">
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        ) : (
          <Button onClick={onAction} className="shadow-sm shadow-[var(--color-primary)]/20">{actionLabel}</Button>
        )
      )}
    </div>
  );
}