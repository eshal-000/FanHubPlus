import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={() => onOpenChange?.(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      {children}
    </div>,
    document.body
  );
}

export function DialogContent({ className = "", children, ...props }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      className={`relative z-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_0_40px_var(--glow)] ${className}`}
      {...props}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() =>
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
        }
        className="absolute right-4 top-4 rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--surface-light)] hover:text-[var(--cream)]"
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

export function DialogHeader({ className = "", children, ...props }) {
  return (
    <div className={`mb-4 flex flex-col gap-1.5 pr-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = "", children, ...props }) {
  return (
    <h2 className={`font-['Orbitron'] leading-none tracking-wider ${className}`} {...props}>
      {children}
    </h2>
  );
}
