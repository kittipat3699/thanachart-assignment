import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/90 text-primary-foreground shadow-[0_14px_28px_-18px_rgba(64,98,220,0.88)] hover:-translate-y-0.5 hover:bg-primary",
        secondary:
          "border-white/70 bg-white/55 text-foreground backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:bg-white/75",
        outline:
          "border-white/70 bg-white/36 text-foreground backdrop-blur-xl hover:bg-white/60",
        destructive:
          "border-red-300/75 bg-red-50/80 text-red-700 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] hover:bg-red-100/85",
        ghost: "border-transparent bg-transparent text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
