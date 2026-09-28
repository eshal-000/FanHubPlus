const Table = ({ className = "", ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={`w-full caption-bottom border-collapse ${className}`} {...props} />
  </div>
);

const TableHeader = ({ className = "", ...props }) => (
  <thead className={className} {...props} />
);

const TableBody = ({ className = "", ...props }) => (
  <tbody className={className} {...props} />
);

const TableRow = ({ className = "", ...props }) => (
  <tr
    className={`border-b border-[var(--border)] transition-colors hover:bg-surface-light/40 ${className}`}
    {...props}
  />
);

const TableHead = ({ className = "", ...props }) => (
  <th
    className={`h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wider ${className}`}
    {...props}
  />
);

const TableCell = ({ className = "", ...props }) => (
  <td className={`px-3 py-3 align-middle text-sm ${className}`} {...props} />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
