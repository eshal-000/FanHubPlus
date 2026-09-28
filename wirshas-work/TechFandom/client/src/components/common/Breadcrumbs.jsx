import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, ShieldCheck } from "lucide-react";

export default function Breadcrumbs({ items }) {
  const { pathname } = useLocation();

  const crumbs =
    items ||
    pathname
      .split("/")
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        to: "/" + arr.slice(0, i + 1).join("/"),
        isLast: i === arr.length - 1,
      }));

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs">
      <Link
        to={pathname.startsWith("/admin") ? "/admin" : "/"}
        className="flex items-center gap-1 text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
      >
        {pathname.startsWith("/admin") ? (
          <ShieldCheck className="h-3.5 w-3.5" />
        ) : (
          <Home className="h-3.5 w-3.5" />
        )}
        {pathname.startsWith("/admin") ? "Admin" : "Fan Hub"}
      </Link>

      {crumbs.map((c) => (
        <span key={c.to} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted/50" />
          {c.isLast || c.to === pathname ? (
            <span className="font-semibold text-[var(--cream)]">{c.label}</span>
          ) : (
            <Link to={c.to} className="text-[var(--muted)] transition-colors hover:text-[var(--primary)]">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}