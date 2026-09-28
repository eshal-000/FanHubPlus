import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Flame, Newspaper, Search, SearchX } from "lucide-react";
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
import ArticleCard from "@/components/discovery/ArticleCard";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = [
  "Reviews",
  "Theories",
  "News",
  "Interviews",
  "Guides",
  "Opinion",
  "Fan Fiction",
  "Editorials",
];
const SORTS = [
  { value: "-publishedAt", label: "Latest" },
  { value: "-views", label: "Most Popular" },
  { value: "title", label: "Alphabetical" },
];

function FeaturedHero({ article, onOpen }) {
  const { isBookmarked, toggle, requireLogin, showLoginPrompt, closeLoginPrompt } = useBookmarks();
  const saved = isBookmarked(article._id);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (requireLogin()) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await toggle(article._id, "article");
    } catch {
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
        onClick={onOpen}
        role="link"
        tabIndex={0}
        aria-label={`Featured article: ${article.title}`}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_20px_var(--glow)]"
      >
        {article.coverImage ? (
          <motion.img
            src={article.coverImage}
            alt={`${article.title} — featured article cover`}
            className="h-72 w-full object-cover sm:h-96"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-[var(--surface)] sm:h-96">
            <Newspaper className="h-12 w-12 text-[var(--muted)]/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--nav)] via-[var(--nav)]/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--cream)]">
              <Flame className="h-3 w-3" /> FEATURED
            </span>
            {article.fandom && (
              <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-semibold text-[var(--bg)]">
                {article.fandom}
              </span>
            )}
            {article.category && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--nav)]/60 px-3 py-1 text-xs uppercase tracking-wider text-[var(--muted)] backdrop-blur-md">
                {article.category}
              </span>
            )}
          </div>

          <h2 className="font-['Orbitron'] text-xl font-bold leading-tight tracking-wide text-[var(--cream)] sm:text-3xl">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 max-w-2xl line-clamp-2 text-sm text-[var(--muted)] sm:text-base">
              {article.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-[var(--cream)]/80">
            <span className="font-medium">by {article.author || "Unknown"}</span>
            {article.publishedAt && <span>· {new Date(article.publishedAt).toLocaleDateString()}</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          aria-label={saved ? `Remove "${article.title}" from bookmarks` : `Bookmark "${article.title}"`}
          aria-pressed={saved}
          className="absolute right-4 top-4 rounded-full border border-[var(--border)] bg-[var(--nav)]/70 p-2.5 backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_var(--glow)]"
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-[var(--yellow)]" />
          ) : (
            <Bookmark className="h-5 w-5 text-[var(--cream)]" />
          )}
        </button>
      </motion.section>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 sm:h-96" />
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md">
      <div className="aspect-video animate-pulse bg-[var(--surface-light)]/50" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--surface-light)]/70" />
        <div className="h-2.5 w-full animate-pulse rounded bg-[var(--surface-light)]/50" />
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-[var(--surface-light)]/50" />
      </div>
    </div>
  );
}

export default function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fandom, setFandom] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("-publishedAt");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const fetchArticles = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { sort };
        if (fandom !== "all") params.fandom = fandom;
        if (category !== "all") params.category = category;
        if (search) params.search = search;

        const { data } = await axios.get(`${API}/articles`, { params });
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];

        const explicit = items.find((a) => a.featured && a.status !== "draft");
        const pick = explicit || items.find((a) => a.status !== "draft") || items[0] || null;

        setFeatured(pick);
        setArticles(pick ? items.filter((a) => a._id !== pick._id) : items);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load articles.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      cancelled = true;
    };
  }, [fandom, category, search, sort]);

  const openArticle = (a) => navigate(`/articles/${a._id}`);

  const activeFilters = useMemo(
    () => (fandom !== "all" ? 1 : 0) + (category !== "all" ? 1 : 0) + (search ? 1 : 0),
    [fandom, category, search]
  );

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
            FANDOM <span className="text-[var(--primary)]">JOURNAL</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Reviews, theories and news from every corner of the hub.
          </p>
        </motion.div>

        {loading ? (
          <FeaturedSkeleton />
        ) : featured ? (
          <FeaturedHero article={featured} onOpen={() => openArticle(featured)} />
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title or author…"
                aria-label="Search articles by title or author"
                className="border-[var(--border)] bg-[var(--nav)]/60 pl-9 text-[var(--cream)] placeholder:text-[var(--muted)]/50"
              />
            </div>

            <Select value={fandom} onValueChange={setFandom}>
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
                <SelectValue placeholder="All fandoms" />
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
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
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
                  setSearchInput("");
                }}
                className="h-7 text-xs text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {!loading && articles.length > 0 && (
          <h2 className="mb-4 font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
            ALL ARTICLES
          </h2>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-3 text-sm">
            {error}{" "}
            <button
              onClick={() => setSort((s) => s)}
              className="font-semibold text-[var(--primary)] underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">NO ARTICLES FOUND</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              {activeFilters > 0
                ? "Try clearing a filter or a different search."
                : "No stories published yet — the writers are warming up."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <ArticleCard key={a._id} article={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
