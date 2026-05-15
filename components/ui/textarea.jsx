"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded border border-[#e8edf5] bg-white px-3 py-2 text-sm text-[#061b31] placeholder:text-[#94a3b8] transition-colors duration-150 resize-none",
        "focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/10",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8fafc]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };