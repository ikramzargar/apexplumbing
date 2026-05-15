"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)] hover:shadow-md",
        destructive: "bg-[var(--color-danger)] text-white hover:bg-[#c53030] focus-visible:ring-[var(--color-danger)] hover:shadow-md",
        outline: "border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-navy)] hover:bg-[var(--color-bg)] hover:border-[var(--color-border-strong)]",
        secondary: "bg-[var(--color-bg-subtle)] text-[var(--color-navy)] hover:bg-[var(--color-bg-muted)]",
        ghost: "text-[var(--color-body)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-navy)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
        success: "bg-[var(--color-success)] text-white hover:bg-[#13a94a] focus-visible:ring-[var(--color-success)] hover:shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
