import { createContext, useContext, useState } from "react";

const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className = "", children, ...props }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;

  const ctx = {
    active,
    setValue: (v) => {
      setInternal(v);
      onValueChange?.(v);
    },
    baseId: `tabs-${Math.random().toString(36).slice(2, 8)}`,
  };

  return (
    <TabsCtx.Provider value={ctx}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap items-center gap-1 rounded-lg p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx.active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      onClick={() => ctx.setValue(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  if (ctx.active !== value) return null;
  return (
    <div
      role="tabpanel"
      data-state={ctx.active === value ? "active" : "inactive"}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
