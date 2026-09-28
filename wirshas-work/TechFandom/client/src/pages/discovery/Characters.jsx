import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Filter, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CharacterCard from "@/components/discovery/CharacterCard";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import FandomSlider from "@/components/discovery/FandomSlider";
import BookmarkBadge from "@/components/common/BookmarkBadge";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = [
  "Protagonist",
  "Antagonist",
  "Supporting",
  "Idol",
  "Mentor",
  "Rival",
  "Comic Relief",
  "Legendary",
];
const SORTS = [
  { value: "name", label: "Alphabetical (A–Z)" },
  { value: "-createdAt", label: "Recently Added" },
];

function CharacterCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/40 backdrop-blur-md">
      <div className="aspect-[4/5] animate-pulse bg-surface-light/50" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-light/70" />
        <div className="h-2.5 w-full animate-pulse rounded bg-surface-light/50" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-surface-light/50" />
      </div>
      <span className="sr-only">Loading character…</span>
      <span className="hidden">Loading character…</span>
    </div>
  );
}

export default function Characters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fandom, setFandom] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const fetchChars = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (fandom !== "all") params.fandom = fandom;
        if (category !== "all") params.category = category;
        if (search) params.search = search;
        params.sort = sort;

        const { data } = await axios.get(`${API}/characters`, { params });
        setCharacters(
          Array.isArray(data) ? data : data?.items || data?.data || []
        );
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Could not load characters.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchChars();
    return () => {
      cancelled = true;
    };
  }, [fandom, category, search, sort]);

  const activeFilters = useMemo(
    () => (fandom !== "all" ? 1 : 0) + (category !== "all" ? 1 : 0) + (search ? 1 : 0),
    [fandom, category, search]
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      {}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <Breadcrumbs />
          <BookmarkBadge />
        </div>

        <FandomSlider />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="font-['Orbitron'] text-3xl font-bold tracking-wide">
            CHARACTER <span className="text-[var(--primary)]">VAULT</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Every icon across every fandom — filter, search and bookmark your faves.
          </p>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 rounded-2xl border border-[var(--border)] bg-surface/40 p-4 backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name…"
                aria-label="Search characters by name"
                className="border-[var(--border)] bg-nav/60 pl-9 text-[var(--cream)] placeholder:text-muted/50"
              />
            </div>

            {}
            <Select value={fandom} onValueChange={setFandom}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)]">
                <SelectValue placeholder="All fandoms" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All fandoms</SelectItem>
                {FANDOMS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)]">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-[var(--muted)]" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {}
          {activeFilters > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                <Filter className="h-3 w-3" /> {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFandom("all");
                  setCategory("all");
                  setSearchInput("");
                }}
                className="h-7 text-xs text-[var(--primary)] hover:bg-primary/10"
              >
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {}
        {error && (
          <div className="mb-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
            {error}{" "}
            <button
              onClick={() => setSearch((s) => s)}
              className="font-semibold text-[var(--primary)] underline"
            >
              Retry
            </button>
          </div>
        )}

        {}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        ) : characters.length === 0 ? (

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-surface/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
              NO CHARACTERS FOUND
            </p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              {activeFilters > 0
                ? "Try clearing a filter or searching a different name."
                : "The vault is empty for now — check back soon."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {characters.map((c, i) => (
              <CharacterCard key={c._id} character={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
