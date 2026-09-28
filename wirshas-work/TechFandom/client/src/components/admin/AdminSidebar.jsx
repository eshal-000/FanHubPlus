import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  ChevronLeft,
  Clapperboard,
  Gamepad2,
  Gauge,
  GraduationCap,
  Inbox,
  Layers,
  LogOut,
  MapPin,
  Newspaper,
  Package,
  Rocket,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";

const GROUPS = [
  {
    label: "General",
    items: [{ to: "/admin", label: "Overview", icon: Gauge, end: true }],
  },
  {
    label: "Fandom",
    items: [
      { to: "/admin/content", label: "Manage Content", icon: Layers },
      { to: "/admin/characters", label: "Characters", icon: Gamepad2 },
      { to: "/admin/articles", label: "Articles", icon: Newspaper },
      { to: "/admin/media", label: "Multimedia", icon: Clapperboard },
      { to: "/admin/events", label: "Location Events", icon: MapPin },
      { to: "/admin/releases", label: "Releases", icon: CalendarClock },
      { to: "/admin/merch", label: "Merch Showcase", icon: Rocket },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/admin/submissions", label: "Submissions", icon: Inbox },
      { to: "/admin/feedback", label: "Feedback & Bugs", icon: Users },
      { to: "/admin/users", label: "User Management", icon: UserCog },
    ],
  },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const Item = ({ to, label, icon: Icon, end }) => {
    const active = end ? pathname === to : pathname.startsWith(to);
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? label : undefined}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
          active
            ? "bg-[var(--primary)]/15 text-[var(--cream)]"
            : "text-[var(--muted)] hover:bg-surface-light/40 hover:text-[var(--cream)]"
        }`}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl border border-[var(--primary)]/50 bg-[var(--primary)]/10 shadow-[0_0_18px_var(--glow)]"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
        <span
          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
            active
              ? "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_14px_var(--glow)]"
              : "bg-[var(--nav)]/70 text-[var(--muted)] group-hover:scale-110 group-hover:text-[var(--yellow)]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {!collapsed && <span className="relative z-10 font-medium">{label}</span>}
      </Link>
    );
  };

  const Nav = () => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {GROUPS.map((g) => (
        <div key={g.label}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]/70">
              {g.label}
            </p>
          )}
          <div className="space-y-1">
            {g.items.map((it) => (
              <Item key={it.to} {...it} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  const Brand = () => (
    <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--raspberry)] shadow-[0_0_20px_var(--glow)]">
        <ShieldCheck className="h-5 w-5 text-[var(--cream)]" />
      </span>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-['Orbitron'] text-sm font-bold tracking-wider text-[var(--cream)]">
            FAN HUB <span className="text-[var(--primary)]">+</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Command Deck</p>
        </div>
      )}
    </div>
  );

  const Footer = () => (
    <div className="border-t border-[var(--border)] p-3">
      <button
        onClick={() => {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-all hover:bg-[var(--primary)]/15 hover:text-[var(--primary)]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--nav)]/70">
          <LogOut className="h-4 w-4" />
        </span>
        {!collapsed && <span className="font-medium">Log Out</span>}
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
        className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-nav/80 shadow-[0_0_20px_var(--glow)] backdrop-blur-md lg:hidden"
      >
        <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-[var(--border)] bg-nav/90 backdrop-blur-xl transition-all duration-300 lg:flex ${
          collapsed ? "w-[84px]" : "w-64"
        }`}
      >
        <Brand />
        <Nav />
        <Footer />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar width"
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-[0_0_12px_var(--glow)] transition-transform hover:scale-110 hover:text-[var(--cream)]"
        >
          <ChevronLeft
            className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-[80] flex w-72 flex-col border-r border-[var(--border)] bg-[var(--nav)] backdrop-blur-xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin menu"
                className="absolute right-3 top-4 rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--cream)]"
              >
                <X className="h-4 w-4" />
              </button>
              <Brand />
              <Nav />
              <Footer />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function AdminShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-96 w-96 rounded-full bg-[var(--primary)] opacity-[0.07] blur-[140px]"
      />
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="relative z-10 min-h-screen px-4 py-6 pt-16 sm:px-6 lg:px-8 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
