import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/65 bg-white/55 px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
