import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Eye, Clock, Newspaper, User as UserIcon, Share2 } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import LoginPromptModal from "@/components/common/LoginPromptModal";
import useBookmarks from "@/hooks/useBookmarks";
import ArticleCard from "@/components/discovery/ArticleCard";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-[var(--primary)] to-[var(--yellow)]"
    />
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true">
      <div className="h-4 w-64 animate-pulse rounded bg-surface-light/60" />
      <div className="mt-6 aspect-video w-full animate-pulse rounded-2xl bg-surface-light/50" />
      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-surface-light/60" />
        <div className="h-3 w-40 animate-pulse rounded bg-surface-light/50" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-light/40" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-surface-light/40" />
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
  const [copied, setCopied] = useState(false);
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
    if (requireLogin()) return;
    try {
      await toggle(article._id, "article");
    } catch {}
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans']">
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
        <Newspaper className="h-12 w-12 text-[var(--muted)]" />
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

  const heroImg =
    article.imageUrls?.[0] ||
    article.coverImage ||
    article.image ||
    null;

  const bodyHtml = article.body || article.content || "<p>No content yet.</p>";

  const textLength = (article.body || article.content || "").replace(/<[^>]*>/g, "").length;
  const readingTime = Math.max(1, Math.ceil(textLength / 1000));

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <ReadingProgress />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Articles", to: "/articles" },
              { label: article.title, isLast: true },
            ]}
          />
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mt-2 -ml-2 text-[var(--muted)] hover:text-[var(--cream)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-[0_0_40px_var(--glow)]"
        >
          {heroImg ? (
            <img
              src={heroImg}
              alt={`${article.title} — article cover`}
              className="aspect-[16/9] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center bg-[var(--surface)]">
              <Newspaper className="h-16 w-16 text-muted/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[var(--nav)] via-[var(--nav)]/40 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {article.fandom && (
                <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--bg)]">
                  {article.fandom}
                </span>
              )}
              {article.category && (
                <span className="rounded-full border border-[var(--border)] bg-[var(--nav)]/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--cream)] backdrop-blur-md">
                  {article.category}
                </span>
              )}
            </div>

            <h1 className="font-['Orbitron'] text-2xl font-bold leading-tight tracking-wide text-[var(--cream)] sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-surface/40 px-5 py-4 backdrop-blur-md"
        >
          <div className="flex flex-wrap items-center gap-5 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/20">
                <UserIcon className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <span className="font-medium text-[var(--cream)]">{article.author || "Unknown"}</span>
            </span>

            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </span>

            {typeof article.views === "number" && (
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {article.views.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-[var(--muted)] hover:text-[var(--cream)]"
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </Button>

            <Button
              onClick={handleBookmark}
              aria-pressed={saved}
              size="sm"
              className={`${
                saved
                  ? "bg-[var(--surface-light)] text-[var(--yellow)] hover:bg-[var(--surface-light)]"
                  : "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
              }`}
            >
              {saved ? <BookmarkCheck className="mr-1.5 h-4 w-4" /> : <Bookmark className="mr-1.5 h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-label="Article body"
          className="prose prose-invert mx-auto mt-10 max-w-3xl 
            text-base leading-relaxed text-cream/90
            [&_a]:text-[var(--primary)] [&_a]:underline [&_a]:decoration-[var(--primary)]/40 [&_a]:underline-offset-4
            [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:bg-[var(--surface)]/30 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg [&_blockquote]:text-[var(--muted)] [&_blockquote]:italic
            [&_h1]:font-['Orbitron'] [&_h1]:text-[var(--cream)]
            [&_h2]:font-['Orbitron'] [&_h2]:text-[var(--cream)] [&_h2]:mt-8 [&_h2]:tracking-wide
            [&_h3]:font-['Orbitron'] [&_h3]:text-[var(--cream)] [&_h3]:mt-6 [&_h3]:tracking-wide
            [&_img]:rounded-xl [&_img]:shadow-[0_0_20px_var(--glow)]
            [&_li]:marker:text-[var(--primary)]
            [&_strong]:text-[var(--yellow)] [&_strong]:font-bold
            [&_p]:mt-4"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {relatedArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 border-t border-[var(--border)] pt-10"
            aria-label="Related articles"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-['Orbitron'] text-lg font-bold tracking-widest text-[var(--cream)]">
                RELATED <span className="text-[var(--primary)]">ARTICLES</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.slice(0, 3).map((a, i) => (
                <ArticleCard key={a._id} article={a} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </div>
  );
}