import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };