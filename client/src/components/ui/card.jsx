const Card = ({ className = "", ...props }) => (
  <div
    className={`rounded-2xl border border-[var(--border)] bg-surface/40 text-[var(--cream)] backdrop-blur-md ${className}`}
    {...props}
  />
);

const CardHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 p-5 ${className}`} {...props} />
);

const CardTitle = ({ className = "", ...props }) => (
  <h3 className={`font-['Orbitron'] font-semibold leading-none tracking-wider ${className}`} {...props} />
);

const CardContent = ({ className = "", ...props }) => (
  <div className={`p-5 pt-0 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };
