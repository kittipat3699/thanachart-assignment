"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: SwitchProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked
          ? "border-primary/60 bg-primary/90 shadow-[0_8px_20px_-14px_rgba(52,84,216,0.9)]"
          : "border-white/70 bg-white/55",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow-[0_3px_10px_rgba(28,43,84,0.25)] transition-transform duration-200",
          checked ? "translate-x-[21px]" : "translate-x-[1px]"
        )}
      />
    </button>
  );
}
