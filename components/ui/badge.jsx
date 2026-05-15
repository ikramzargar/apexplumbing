"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-white",
        primary: "bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-border)]",
        secondary: "bg-[var(--color-bg-subtle)] text-[var(--color-body)] border border-[var(--color-border)]",
        destructive: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-border)]",
        danger: "bg-[var(--color-danger)] text-white",
        outline: "border border-[var(--color-border)] text-[var(--color-body)]",
        success: "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]",
        warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
        info: "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-bg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };