import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SearchX,
  Sparkles,
  Filter,
  ShoppingBag,
  TrendingUp,
  Tag as TagIcon,
} from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MerchCard from "@/components/discovery/MerchCard";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import BookmarkBadge from "@/components/common/BookmarkBadge";

const API = `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = ["Apparel", "Figures", "Posters", "Accessories", "Plushies", "Collectibles", "Stationery", "Vinyl"];
const POPULAR_TAGS = ["Limited Edition", "Pre-Order", "Collectible", "Exclusive", "Restock"];

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

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-surface/40 backdrop-blur-md">
      <div className="aspect-square animate-pulse bg-surface-light/50" />
      <div className="space-y-2 p-5">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-light/70" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-light/50" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-light/50" />
      </div>
    </div>
  );
}

export default function Merch() {
  const [merch, setMerch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fandom, setFandom] = useState("all");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [groupBy, setGroupBy] = useState("fandom");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const fetchMerch = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (fandom !== "all") params.fandom = fandom;
        if (category !== "all") params.category = category;
        if (tag !== "all") params.tags = tag;
        if (search) params.search = search;

        const { data } = await axios.get(`${API}/merch`, { params });
        setMerch(Array.isArray(data) ? data : data?.items || data?.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load merch.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMerch();
    return () => {
      cancelled = true;
    };
  }, [fandom, category, tag, search]);

  const activeFilters = useMemo(
    () =>
      (fandom !== "all" ? 1 : 0) +
      (category !== "all" ? 1 : 0) +
      (tag !== "all" ? 1 : 0) +
      (search ? 1 : 0),
    [fandom, category, tag, search]
  );

  const sections = useMemo(() => {
    if (groupBy === "none" || activeFilters > 2) {
      return [{ key: "all", label: "", items: merch }];
    }
    const map = new Map();
    for (const m of merch) {
      const key =
        groupBy === "fandom" ? m.fandom || "Multi-fandom" : m.category || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    return Array.from(map.entries()).map(([k, items]) => ({
      key: k,
      label: k.toUpperCase(),
      items,
    }));
  }, [merch, groupBy, activeFilters]);

  const clearFilters = () => {
    setFandom("all");
    setCategory("all");
    setTag("all");
    setSearchInput("");
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
              Fandom Collectibles
            </span>
          </div>
          <h1 className="font-['Orbitron'] text-4xl font-bold tracking-wide sm:text-5xl">
            MERCH{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--primary)]">SHOWCASE</span>
              <motion.span
                className="absolute inset-0 z-0 blur-xl bg-[var(--primary)] opacity-60"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            A curated gallery of fandom collectibles — browse, bookmark, admire. (Links out to
            official stores; no checkout here.)
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-surface/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] backdrop-blur-md">
              <ShoppingBag className="h-3 w-3 text-[var(--primary)]" />
              {merch.length} {merch.length === 1 ? "item" : "items"} found
            </span>
            {fandom !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] backdrop-blur-md">
                <TagIcon className="h-3 w-3" />
                {fandom}
              </span>
            )}
            {tag !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--yellow)]/40 bg-[var(--yellow)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--yellow)] backdrop-blur-md">
                <TagIcon className="h-3 w-3" />
                {tag}
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

          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search merch…"
                aria-label="Search merchandise"
                className="border-[var(--border)] bg-nav/60 pl-9 text-[var(--cream)] placeholder:text-muted/50 backdrop-blur-md"
              />
            </div>

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

            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All tags</SelectItem>
                {POPULAR_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)] backdrop-blur-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="fandom">Group: Fandom</SelectItem>
                <SelectItem value="category">Group: Category</SelectItem>
                <SelectItem value="none">No grouping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm backdrop-blur-md">
            {error}{" "}
            <button onClick={() => setSearch((s) => s)} className="font-semibold text-[var(--primary)] underline">
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
        ) : merch.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-surface/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">NO MERCH FOUND</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              {activeFilters > 0
                ? "Try clearing a filter or two."
                : "The showcase is being stocked — check back soon."}
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
        ) : (
          <div className="space-y-12">
            {sections.map((sec, groupIndex) => (
              <motion.section
                key={sec.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: groupIndex * 0.05 }}
              >
                {sec.label && (
                  <div className="mb-5 flex items-center gap-4">
                    <h2 className="flex items-center gap-2 font-['Orbitron'] text-sm font-bold tracking-widest text-[var(--cream)]">
                      <ShoppingBag className="h-4 w-4 text-[var(--primary)]" />
                      {sec.label}
                    </h2>
                    <span
                      className="h-px flex-1"
                      style={{
                        background: `linear-gradient(to right, var(--primary), transparent)`,
                      }}
                    />
                    <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-surface/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] backdrop-blur-md">
                      <TrendingUp className="h-3 w-3" />
                      {sec.items.length} item{sec.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {sec.items.map((m, i) => (
                    <MerchCard key={m._id} merch={m} index={i} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
