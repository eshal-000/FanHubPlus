import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Bookmark, BookmarkCheck, User as UserIcon } from "lucide-react";
import useBookmarks from "@/hooks/useBookmarks";
import LoginPromptModal from "@/components/common/LoginPromptModal";

export default function ArticleCard({ article, index = 0 }) {
  const navigate = useNavigate();
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
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
        whileHover={{ y: -6 }}
        onClick={() => navigate(`/articles/${article._id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate(`/articles/${article._id}`);
        }}
        role="link"
        tabIndex={0}
        aria-label={`Read article: ${article.title}`}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 shadow-[0_0_20px_var(--glow)] backdrop-blur-md transition-shadow hover:shadow-[0_0_30px_var(--glow)]"
      >
        <div className="relative aspect-video overflow-hidden bg-[var(--surface-light)]">
          {article.coverImage ? (
            <motion.img
              src={article.coverImage}
              alt={`${article.title} — article cover`}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.45 }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <UserIcon className="h-10 w-10 text-[var(--muted)]/40" />
            </span>
          )}

          {article.fandom && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--yellow)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bg)]">
              {article.fandom}
            </span>
          )}

          <button
            type="button"
            onClick={handleBookmark}
            aria-label={saved ? `Remove "${article.title}" from bookmarks` : `Bookmark "${article.title}"`}
            aria-pressed={saved}
            className="absolute right-3 top-3 rounded-full border border-[var(--border)] bg-[var(--nav)]/70 p-2 backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_var(--glow)]"
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-[var(--yellow)]" />
            ) : (
              <Bookmark className="h-4 w-4 text-[var(--cream)]" />
            )}
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {article.category && (
            <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--primary)]">
              {article.category}
            </span>
          )}
          <h3 className="line-clamp-2 font-['Orbitron'] text-sm font-bold leading-snug tracking-wide text-[var(--cream)]">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {article.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-[var(--muted)]">
            <span className="truncate font-medium text-[var(--cream)]/80">
              by {article.author || "Unknown"}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString()
                : "Draft"}
            </span>
          </div>
        </div>
      </motion.article>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
}
