import { forwardRef } from "react";

const Input = forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-lg border border-[var(--border)] bg-nav/60 px-3 py-2 text-sm text-[var(--cream)] placeholder:text-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
