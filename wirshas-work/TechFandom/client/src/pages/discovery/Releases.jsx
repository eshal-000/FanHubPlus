import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  ExternalLink,
  SearchX,
  X,
  Sparkles,
  Filter,
  Flame,
  Clock,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReleaseCard, { daysUntil } from "@/components/discovery/ReleaseCard";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import BookmarkBadge from "@/components/common/BookmarkBadge";
import DemoLinkModal from "@/components/common/DemoLinkModal";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const RELEASE_TYPES = ["anime", "game", "movie", "show", "comic", "merch"];
const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = ["Sequel", "Season", "Reboot", "Adaptation", "Original", "DLC", "Expansion", "Special"];
const STATUSES = ["upcoming", "released", "delayed"];
const SORTS = [
  { value: "releaseDate", label: "Soonest First" },
  { value: "title", label: "Alphabetical" },
];

function GlowBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--primary)] opacity-[0.12] blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 top-1/3 h-[450px] w-[450px] rounded-full bg-[var(--raspberry)] opacity-[0.14] blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-[var(--yellow)] opacity-[0.08] blur-[110px]"
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function DateNavigator({ activeYear, activeMonth, onChange, availableYears }) {
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
          <span className="font-['Orbitron'] text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Year
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ year: "all", month: "all" })}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              activeYear === "all"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]"
                : "border-[var(--border)] bg-nav/60 text-[var(--muted)] hover:text-[var(--cream)]"
            }`}
          >
            All
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => onChange({ year, month: "all" })}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                activeYear === year
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]"
                  : "border-[var(--border)] bg-nav/60 text-[var(--muted)] hover:text-[var(--cream)]"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--yellow)]" />
          <span className="font-['Orbitron'] text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Month
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ year: activeYear, month: "all" })}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              activeMonth === "all"
                ? "border-[var(--yellow)] bg-[var(--yellow)] text-[var(--bg)] shadow-[0_0_15px_rgba(255,227,71,0.5)]"
                : "border-[var(--border)] bg-nav/60 text-[var(--muted)] hover:text-[var(--cream)]"
            }`}
          >
            All
          </button>
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => onChange({ year: activeYear, month: i })}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                activeMonth === i
                  ? "border-[var(--yellow)] bg-[var(--yellow)] text-[var(--bg)] shadow-[0_0_15px_rgba(255,227,71,0.5)]"
                  : "border-[var(--border)] bg-nav/60 text-[var(--muted)] hover:text-[var(--cream)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReleaseModal({ release, onClose, onOfficial }) {
  const days = daysUntil(release.releaseDate);
  const statusColor =
    release.status === "released"
      ? "#7DD3FC"
      : release.status === "delayed"
      ? "#99004D"
      : "#FFE347";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-nav/85 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${release.title}`}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: `0 0 60px ${statusColor}30, 0 0 20px rgba(0,0,0,0.5)` }}
      >
        <button
          onClick={onClose}
          aria-label="Close release details"
          className="absolute right-4 top-4 z-20 rounded-full border border-[var(--border)] bg-nav/80 p-2 text-[var(--muted)] backdrop-blur-md transition-all hover:text-[var(--cream)] hover:scale-110"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={`${release.title} — poster`}
              className="aspect-video max-h-64 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video max-h-64 items-center justify-center bg-[var(--surface-light)] font-['Orbitron'] text-5xl text-muted/30">
              {release.title?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />

          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
            style={{
              background: `${statusColor}30`,
              color: statusColor,
              border: `1px solid ${statusColor}80`,
            }}
          >
            {release.status || "upcoming"}
          </span>
        </div>

        <div className="overflow-y-auto p-6">
          <h2 className="font-['Orbitron'] text-xl font-bold tracking-wide text-[var(--cream)] sm:text-2xl">
            {release.title}
          </h2>
          <p className="mt-2 text-xs uppercase tracking-wider text-[var(--muted)]">
            {release.releaseType} · {release.fandom || "Multi-fandom"}
            {release.category ? ` · ${release.category}` : ""}
          </p>

          <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
            <p className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
              {release.releaseDate
                ? new Date(release.releaseDate).toLocaleDateString(undefined, { dateStyle: "full" })
                : "Date to be announced"}
              {typeof days === "number" && days > 0 && release.status !== "released" && (
                <span className="rounded-full bg-[var(--surface-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--yellow)]">
                  in {days} day{days === 1 ? "" : "s"}
                </span>
              )}
            </p>
            {release.status === "delayed" && (
              <p className="rounded-xl border border-[var(--border)] bg-surface-light/50 px-4 py-2.5 text-xs">
                This release has been delayed — dates may shift.
              </p>
            )}
          </div>

          {release.externalUrl && (
            <button
              onClick={() => onOfficial(release.externalUrl)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-['Orbitron'] text-xs font-bold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:-translate-y-0.5 hover:bg-[var(--raspberry)] hover:shadow-[0_0_30px_var(--glow)]"
            >
              OPEN OFFICIAL PAGE <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-surface/40 backdrop-blur-md">
      <div className="aspect-[3/4] animate-pulse bg-surface-light/50" />
      <div className="space-y-2 p-5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-light/70" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-light/50" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-light/50" />
      </div>
    </div>
  );
}

export default function Releases() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [releaseType, setReleaseType] = useState("all");
  const [fandom, setFandom] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("releaseDate");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [selected, setSelected] = useState(null);
  const [demoLink, setDemoLink] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchReleases = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { sort };
        if (releaseType !== "all") params.releaseType = releaseType;
        if (fandom !== "all") params.fandom = fandom;
        if (category !== "all") params.category = category;
        if (status !== "all") params.status = status;

        const { data } = await axios.get(`${API}/releases`, { params });
        setReleases(Array.isArray(data) ? data : data?.items || data?.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load releases.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReleases();
    return () => {
      cancelled = true;
    };
  }, [releaseType, fandom, category, status, sort]);

  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      if (!r.releaseDate) return year === "all" && month === "all";
      const d = new Date(r.releaseDate);
      if (year !== "all" && d.getFullYear() !== year) return false;
      if (month !== "all" && d.getMonth() !== month) return false;
      return true;
    });
  }, [releases, year, month]);

  const availableYears = useMemo(() => {
    const years = new Set();
    releases.forEach((r) => {
      if (r.releaseDate) years.add(new Date(r.releaseDate).getFullYear());
    });
    return Array.from(years).sort();
  }, [releases]);

  const grouped = useMemo(() => {
    if (sort !== "releaseDate") return null;
    if (year !== "all" && month !== "all") return null; // flat list when filtering by specific month
    if (year !== "all" && month === "all") {
      const map = new Map();
      for (const r of filteredReleases) {
        const d = r.releaseDate ? new Date(r.releaseDate) : null;
        const key = d
          ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
          : "Date TBA";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(r);
      }
      return Array.from(map.entries());
    }
    const map = new Map();
    for (const r of filteredReleases) {
      const d = r.releaseDate ? new Date(r.releaseDate) : null;
      const key = d
        ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
        : "Date TBA";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return Array.from(map.entries());
  }, [filteredReleases, sort, year, month]);

  const handleOpen = (release) => setSelected(release);
  const handleOfficial = (url) => setDemoLink(url);

  const activeFilters =
    (releaseType !== "all" ? 1 : 0) +
    (fandom !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (year !== "all" ? 1 : 0) +
    (month !== "all" ? 1 : 0);

  const clearFilters = () => {
    setReleaseType("all");
    setFandom("all");
    setCategory("all");
    setStatus("all");
    setYear("all");
    setMonth("all");
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <Breadcrumbs />
          <BookmarkBadge />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-[var(--yellow)]" />
            <span className="font-['Orbitron'] text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Upcoming Drops
            </span>
          </div>
          <h1 className="font-['Orbitron'] text-4xl font-bold tracking-wide sm:text-5xl">
            DROP{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--primary)]">RADAR</span>
              <motion.span
                className="absolute inset-0 z-0 blur-xl bg-[var(--primary)] opacity-60"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            Anime seasons, game launches, movie premieres and comic drops — never miss one.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-surface/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] backdrop-blur-md">
              <TrendingUp className="h-3 w-3 text-[var(--primary)]" />
              {filteredReleases.length} {filteredReleases.length === 1 ? "drop" : "drops"} found
            </span>
            {year !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] backdrop-blur-md">
                <CalendarDays className="h-3 w-3" />
                {year}
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-surface/40 p-5 backdrop-blur-xl sm:p-6"
          style={{ boxShadow: "0 0 40px rgba(255, 0, 107, 0.08)" }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[var(--primary)] opacity-20 blur-[80px]" />

          <div className="relative mb-4 flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span className="font-['Orbitron'] text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Filters
            </span>
            {activeFilters > 0 && (
              <>
                <span className="rounded-full bg-[var(--primary)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                  {activeFilters}
                </span>
                <button
                  onClick={clearFilters}
                  className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] underline hover:text-[var(--primary)]"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          <div className="relative mb-5 rounded-2xl border border-[var(--border)] bg-nav/40 p-4">
            <DateNavigator
              activeYear={year}
              activeMonth={month}
              onChange={({ year: y, month: m }) => {
                setYear(y);
                setMonth(m);
              }}
              availableYears={availableYears}
            />
          </div>

          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={releaseType} onValueChange={setReleaseType}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All types</SelectItem>
                {RELEASE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fandom} onValueChange={setFandom}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue placeholder="Fandom" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All fandoms</SelectItem>
                {FANDOMS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm backdrop-blur-md">
            {error}{" "}
            <button onClick={() => setSort((s) => s)} className="font-semibold text-[var(--primary)] underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredReleases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-surface/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">NO RELEASES FOUND</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              Try widening the filters — the next big drop may be just outside them.
            </p>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : grouped ? (
          <div className="space-y-12">
            {grouped.map(([month, items], groupIndex) => (
              <motion.section
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: groupIndex * 0.05 }}
              >
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="flex items-center gap-2 font-['Orbitron'] text-sm font-bold tracking-widest text-[var(--cream)]">
                    <Flame className="h-4 w-4 text-[var(--primary)]" />
                    {month.toUpperCase()}
                  </h2>
                  <span
                    className="h-px flex-1"
                    style={{
                      background: `linear-gradient(to right, var(--primary), transparent)`,
                    }}
                  />
                  <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-surface/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] backdrop-blur-md">
                    <Clock className="h-3 w-3" />
                    {items.length} drop{items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((r, i) => (
                    <ReleaseCard key={r._id} release={r} index={i} onOpen={handleOpen} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredReleases.map((r, i) => (
              <ReleaseCard key={r._id} release={r} index={i} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <ReleaseModal
            release={selected}
            onClose={() => setSelected(null)}
            onOfficial={handleOfficial}
          />
        )}
      </AnimatePresence>

      <DemoLinkModal
        open={!!demoLink}
        onClose={() => setDemoLink(null)}
        url={demoLink}
        title="OFFICIAL PAGE"
      />
    </div>
  );
}