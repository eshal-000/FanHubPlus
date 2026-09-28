import { createPortal } from "react-dom";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";

const SelectCtx = createContext(null);

export function Select({ value, onValueChange, children, ...props }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (e.target instanceof Element && e.target.closest("[role=\"listbox\"]")) return;
      if (
        rootRef.current && !rootRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const measure = () => {
      const r = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < 300 && r.top > spaceBelow;
      setMenuStyle({
        position: "fixed",
        left: r.left,
        width: r.width,
        ...(openUp ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
        zIndex: 9999,
      });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  const ctxValue = {
    value,
    open,
    setOpen,
    onValueChange,
    placeholderId: useId(),
    triggerRef,
    menuStyle,
  };

  return (
    <SelectCtx.Provider value={ctxValue}>
      <div ref={rootRef} className="relative" {...props}>
        {children}
      </div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({ className = "", children, ...props }) {
  const ctx = useContext(SelectCtx);
  return (
    <button
      ref={ctx.triggerRef}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      aria-labelledby={ctx.placeholderId}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-nav/60 px-3 py-2 text-sm text-[var(--cream)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${ctx.open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function SelectValue({ placeholder, children }) {
  const ctx = useContext(SelectCtx);
  const hasValue = ctx.value !== undefined && ctx.value !== "" && ctx.value !== "all";
  return (
    <span
      id={ctx.placeholderId}
      className={`truncate text-left ${hasValue ? "text-[var(--cream)]" : "text-[var(--muted)]"}`}
    >
      {hasValue ? (children ?? ctx.value) : (placeholder ?? "Select…")}
    </span>
  );
}

export function SelectContent({ className = "", children, ...props }) {
  const ctx = useContext(SelectCtx);
  if (!ctx.open || !ctx.menuStyle) return null;
  return createPortal(
    <div
      role="listbox"
      style={ctx.menuStyle}
      className={`max-h-72 overflow-y-auto rounded-lg border border-[var(--border)] bg-[#390B2B] p-1 shadow-[0_0_20px_var(--glow)] backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export function SelectItem({ value, className = "", children, ...props }) {
  const ctx = useContext(SelectCtx);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => {
        ctx.onValueChange?.(value);
        ctx.setOpen(false);
      }}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        active
          ? "bg-[var(--primary)] text-[var(--cream)]"
          : "text-[var(--cream)] hover:bg-[var(--surface-light)]"
      } ${className}`}
      {...props}
    >
      {children}
      {active && <Check className="h-4 w-4 shrink-0" />}
    </button>
  );
}
