import { forwardRef } from "react";

const variants = {
  default:
    "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]",
  ghost: "bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]",
  secondary: "bg-[var(--surface-light)] text-[var(--cream)] hover:bg-[var(--surface)]",
  destructive: "bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]",
  link: "text-[var(--primary)] underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

const Button = forwardRef(
  ({ className = "", variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
