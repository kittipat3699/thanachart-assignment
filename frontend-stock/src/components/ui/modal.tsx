"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ open, title, onClose, children, footer, className }: ModalProps): React.JSX.Element | null {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn("liquid-shell relative z-10 w-full max-w-2xl rounded-3xl p-5 md:p-6", className)}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Button type="button" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>{children}</div>

        {footer ? <div className="mt-5 flex flex-wrap items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
