import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Newspaper, User as UserIcon } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import LoginPromptModal from "@/components/common/LoginPromptModal";
import useBookmarks from "@/hooks/useBookmarks";
import ArticleCard from "@/components/discovery/ArticleCard";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading article">
      <div className="h-4 w-64 animate-pulse rounded bg-[var(--surface-light)]/60" />
      <div className="mt-6 aspect-video w-full animate-pulse rounded-2xl bg-[var(--surface-light)]/50" />
      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-[var(--surface-light)]/60" />
        <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-light)]/50" />
        <div className="h-3 w-full animate-pulse rounded bg-[var(--surface-light)]/40" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-[var(--surface-light)]/40" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--surface-light)]/40" />
      </div>
    </div>
  );
}

export default function ArticleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isBookmarked, toggle, requireLogin, showLoginPrompt, closeLoginPrompt } = useBookmarks();

  useEffect(() => {
    let cancelled = false;
    const fetchArticle = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API}/articles/${id}`);
        setArticle(data?.article || data);
        setRelatedArticles(data?.relatedArticles || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Article not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchArticle();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const saved = article ? isBookmarked(article._id) : false;

  const handleBookmark = async () => {
    if (requireLogin()) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await toggle(article._id, "article");
    } catch {
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans']"><DetailsSkeleton /></div>;

  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
        <Newspaper className="h-10 w-10 text-[var(--muted)]" />
        <p className="text-lg">{error || "Article not found."}</p>
        <Button
          onClick={() => navigate("/articles")}
          className="bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]"
        >
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Articles", to: "/articles" },
            { label: article.title, isLast: true },
          ]}
        />

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-[var(--muted)] hover:text-[var(--cream)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_20px_var(--glow)]"
        >
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={`${article.title} — article cover`}
              className="aspect-video max-h-[420px] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video max-h-[420px] w-full items-center justify-center bg-[var(--surface)]">
              <Newspaper className="h-12 w-12 text-[var(--muted)]/40" />
            </div>
          )}
        </motion.article>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-8 max-w-3xl"
        >
          <div className="flex flex-wrap items-center gap-2">
            {article.fandom && (
              <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-semibold text-[var(--bg)]">
                {article.fandom}
              </span>
            )}
            {article.category && (
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                {article.category}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-['Orbitron'] text-2xl font-bold leading-tight tracking-wide sm:text-4xl">
              {article.title}
            </h1>
            <Button
              onClick={handleBookmark}
              aria-pressed={saved}
              className={`shrink-0 ${
                saved
                  ? "bg-[var(--surface-light)] text-[var(--yellow)]"
                  : "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
              }`}
            >
              {saved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
              {saved ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> {article.author || "Unknown"}
            </span>
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
            {typeof article.views === "number" && (
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> {article.views.toLocaleString()} views
              </span>
            )}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-label="Article body"
          className="prose prose-invert mx-auto mt-8 max-w-3xl text-[var(--cream)]/90 [&_a]:text-[var(--primary)] [&_a]:underline [&_blockquote]:border-l-[var(--primary)] [&_blockquote]:text-[var(--muted)] [&_h1]:font-['Orbitron'] [&_h2]:font-['Orbitron'] [&_h2]:tracking-wide [&_h3]:font-['Orbitron'] [&_h3]:tracking-wide [&_img]:rounded-xl [&_img]:shadow-[0_0_20px_var(--glow)] [&_li]:marker:text-[var(--primary)] [&_strong]:text-[var(--yellow)]"
          dangerouslySetInnerHTML={{ __html: article.content || "<p>No content yet.</p>" }}
        />

        {relatedArticles.length > 0 && (
          <section className="mt-16" aria-label="Related articles">
            <h2 className="mb-4 font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
              RELATED ARTICLES
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.slice(0, 3).map((a, i) => (
                <ArticleCard key={a._id} article={a} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </div>
  );
}
