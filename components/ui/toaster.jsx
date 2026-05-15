"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-[#e8edf5] bg-white text-[#061b31]",
        destructive: "border-[#fee2e2] bg-white text-[#e53e3e]",
        success: "border-[rgba(21,190,83,0.2)] bg-white text-[#15be53]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-all hover:opacity-100 focus:opacity-100 group-hover:opacity-100",
      "text-[#94a3b8] hover:text-[#64748d] hover:bg-[#f8fafc]",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

const Toaster = () => {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const handleToast = (event) => {
      setToasts((prev) => [...prev, { id: Date.now(), ...event.detail }]);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          className="mt-2"
        >
          <div className="flex items-start gap-3 w-full pr-6">
            {toast.variant === 'destructive' && (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#e53e3e]" />
            )}
            {toast.variant === 'success' && (
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#15be53]" />
            )}
            {toast.variant !== 'destructive' && toast.variant !== 'success' && (
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#64748d]" />
            )}
            <div className="flex flex-col gap-0.5 flex-1">
              {toast.title && <ToastTitle className={toast.variant === 'destructive' ? 'text-[#e53e3e]' : ''}>{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription className={toast.variant === 'destructive' ? 'text-[#e53e3e]/80' : ''}>{toast.description}</ToastDescription>}
            </div>
          </div>
          <ToastClose onClick={() => removeToast(toast.id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  Toaster,
};

export const toast = ({ title, description, variant = 'default' }) => {
  window.dispatchEvent(new CustomEvent('toast', { detail: { title, description, variant } }));
};