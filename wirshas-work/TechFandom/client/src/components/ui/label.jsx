const Label = ({ className = "", ...props }) => (
  <label
    className={`text-xs font-semibold uppercase tracking-wider text-[var(--muted)] ${className}`}
    {...props}
  />
);

export { Label };
