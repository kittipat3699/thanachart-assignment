import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "liquid-shell rounded-3xl p-5 text-card-foreground transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}
