'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export function VerifyPlumberDialog({ open, plumber, onConfirm, onCancel }) {
  if (!plumber) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel?.()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Verify Plumber</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to verify <strong>{plumber.full_name}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Phone</span>
            <span className="font-medium text-[var(--color-text-secondary)]">{plumber.phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">District</span>
            <span className="font-medium text-[var(--color-text-secondary)]">{plumber.district}</span>
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="destructive" onClick={() => onConfirm('REJECTED')} className="flex items-center gap-1.5">
            <XCircle size={15} /> Reject
          </Button>
          <Button onClick={() => onConfirm('VERIFIED')} className="bg-[var(--color-success)] hover:bg-[var(--color-success)] flex items-center gap-1.5">
            <CheckCircle size={15} /> Verify
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}