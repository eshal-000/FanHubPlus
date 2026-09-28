import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, ExternalLink, SearchX, X } from "lucide-react";
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

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const RELEASE_TYPES = ["anime", "game", "movie", "show", "comic", "merch"];
const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = ["Sequel", "Season", "Reboot", "Adaptation", "Original", "DLC", "Expansion", "Special"];
const STATUSES = ["upcoming", "released", "delayed"];
const SORTS = [
  { value: "releaseDate", label: "Soonest First" },
  { value: "title", label: "Alphabetical" },
];

function ReleaseModal({ release, onClose }) {
  const days = daysUntil(release.releaseDate);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--nav)]/85 p-4 backdrop-blur-sm"
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_20px_var(--glow)]"
      >
        <button
          onClick={onClose}
          aria-label="Close release details"
          className="absolute right-3 top-3 z-10 rounded-full border border-[var(--border)] bg-[var(--nav)]/80 p-1.5 text-[var(--muted)] hover:text-[var(--cream)]"
        >
          <X className="h-4 w-4" />
        </button>

        {release.imageUrl ? (
          <img
            src={release.imageUrl}
            alt={`${release.title} — poster`}
            className="aspect-video max-h-64 w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video max-h-64 items-center justify-center bg-[var(--surface-light)] font-['Orbitron'] text-4xl text-[var(--muted)]/30">
            {release.title?.[0]?.toUpperCase() || "?"}
          </div>
        )}

        <div className="p-5">
          <h2 className="font-['Orbitron'] text-xl font-bold tracking-wide text-[var(--cream)]">
            {release.title}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)]">
            {release.releaseType} · {release.fandom || "Multi-fandom"}
            {release.category ? ` · ${release.category}` : ""}
          </p>

          <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <p className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
              {release.releaseDate
                ? new Date(release.releaseDate).toLocaleDateString(undefined, { dateStyle: "full" })
                : "Date to be announced"}
              {typeof days === "number" && days > 0 && release.status !== "released" && (
                <span className="rounded-full bg-[var(--surface-light)] px-2 py-0.5 text-xs text-[var(--yellow)]">
                  in {days} day{days === 1 ? "" : "s"}
                </span>
              )}
            </p>
            {release.status === "delayed" && (
              <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-light)]/50 px-3 py-2 text-xs">
                This release has been delayed — dates may shift.
              </p>
            )}
          </div>

          {release.externalUrl && (
            <a
              href={release.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-['Orbitron'] text-xs font-semibold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-colors hover:bg-[var(--raspberry)]"
            >
              OPEN OFFICIAL PAGE <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
      <div className="aspect-[3/4] animate-pulse bg-[var(--surface-light)]/50" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--surface-light)]/70" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-[var(--surface-light)]/50" />
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
  const [selected, setSelected] = useState(null); // modal

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

  const grouped = useMemo(() => {
    if (sort !== "releaseDate") return null;
    const map = new Map();
    for (const r of releases) {
      const d = r.releaseDate ? new Date(r.releaseDate) : null;
      const key = d
        ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
        : "Date TBA";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return Array.from(map.entries());
  }, [releases, sort]);

  const handleOpen = (release) => {
    if (release.externalUrl) {
      window.open(release.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      setSelected(release);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="font-['Orbitron'] text-3xl font-bold tracking-wide">
            DROP <span className="text-[var(--primary)]">RADAR</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Anime seasons, game launches, movie premieres and comic drops — never miss one.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={releaseType} onValueChange={setReleaseType}>
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
          <div className="mb-6 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-3 text-sm">
            {error}{" "}
            <button onClick={() => setSort((s) => s)} className="font-semibold text-[var(--primary)] underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : releases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">NO RELEASES FOUND</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              Try widening the filters — the next big drop may be just outside them.
            </p>
          </motion.div>
        ) : grouped ? (
          <div className="space-y-10">
            {grouped.map(([month, items]) => (
              <section key={month}>
                <h2 className="mb-4 flex items-center gap-3 font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
                  {month.toUpperCase()}
                  <span className="h-px flex-1 bg-[var(--border)]" />
                  <span className="text-xs normal-case">{items.length} drop{items.length > 1 ? "s" : ""}</span>
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((r, i) => (
                    <ReleaseCard key={r._id} release={r} index={i} onOpen={handleOpen} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {releases.map((r, i) => (
              <ReleaseCard key={r._id} release={r} index={i} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <ReleaseModal release={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
