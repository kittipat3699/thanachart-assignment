import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/75 bg-white/65 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-foreground/80 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}
