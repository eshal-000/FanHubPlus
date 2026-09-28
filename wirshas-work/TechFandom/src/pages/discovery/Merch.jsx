import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MerchCard from "@/components/discovery/MerchCard";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = ["Apparel", "Figures", "Posters", "Accessories", "Plushies", "Collectibles", "Stationery", "Vinyl"];
const POPULAR_TAGS = ["Limited Edition", "Pre-Order", "Collectible", "Exclusive", "Restock"];

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
      <div className="aspect-square animate-pulse bg-[var(--surface-light)]/50" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-[var(--surface-light)]/70" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-[var(--surface-light)]/50" />
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
  const [groupBy, setGroupBy] = useState("fandom"); // fandom | category | none

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
            MERCH <span className="text-[var(--primary)]">SHOWCASE</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            A curated gallery of fandom collectibles — browse, bookmark, admire. (Links out to
            official stores; no checkout here.)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search merch…"
                aria-label="Search merchandise"
                className="border-[var(--border)] bg-[var(--nav)]/60 pl-9 text-[var(--cream)] placeholder:text-[var(--muted)]/50"
              />
            </div>

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

            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="fandom">Group: Fandom</SelectItem>
                <SelectItem value="category">Group: Category</SelectItem>
                <SelectItem value="none">No grouping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFilters > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">
                {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFandom("all");
                  setCategory("all");
                  setTag("all");
                  setSearchInput("");
                }}
                className="h-7 text-xs text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-3 text-sm">
            {error}{" "}
            <button onClick={() => setSearch((s) => s)} className="font-semibold text-[var(--primary)] underline">
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
        ) : merch.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">NO MERCH FOUND</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              {activeFilters > 0
                ? "Try clearing a filter or two."
                : "The showcase is being stocked — check back soon."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {sections.map((sec) => (
              <section key={sec.key}>
                {sec.label && (
                  <h2 className="mb-4 flex items-center gap-3 font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
                    {sec.label}
                    <span className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-xs normal-case">{sec.items.length} item{sec.items.length > 1 ? "s" : ""}</span>
                  </h2>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {sec.items.map((m, i) => (
                    <MerchCard key={m._id} merch={m} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
