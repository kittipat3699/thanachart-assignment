import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[96px] w-full rounded-xl border border-white/65 bg-white/55 px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
