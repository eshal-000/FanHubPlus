import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, ShoppingBag } from "lucide-react";
import useBookmarks from "@/hooks/useBookmarks";
import LoginPromptModal from "@/components/common/LoginPromptModal";

export default function MerchCard({ merch, index = 0 }) {
  const navigate = useNavigate();
  const { isBookmarked, toggle, requireLogin, showLoginPrompt, closeLoginPrompt } = useBookmarks();

  const saved = isBookmarked(merch._id);
  const image = (Array.isArray(merch.images) && merch.images[0]) || merch.image;

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (requireLogin()) {
      return;
    }
    try {
      await toggle(merch._id, "merch");
    } catch {

    }
  };

  const open = () => navigate(`/merch/${merch._id}`);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
        whileHover={{ y: -6 }}
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        role="link"
        tabIndex={0}
        aria-label={`View merch: ${merch.name}`}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/40 shadow-[0_0_20px_var(--glow)] backdrop-blur-md transition-shadow hover:shadow-[0_0_30px_var(--glow)]"
      >
        <div className="relative aspect-square overflow-hidden bg-[var(--surface-light)]">
          {image ? (
            <motion.img
              src={image}
              alt={`${merch.name} — ${merch.fandom || "fandom"} merchandise`}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.45 }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted/40" />
            </span>
          )}

          {merch.fandom && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--yellow)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bg)]">
              {merch.fandom}
            </span>
          )}

          <button
            type="button"
            onClick={handleBookmark}
            aria-label={saved ? `Remove ${merch.name} from bookmarks` : `Bookmark ${merch.name}`}
            aria-pressed={saved}
            className="absolute right-3 top-3 rounded-full border border-[var(--border)] bg-nav/70 p-2 backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_var(--glow)]"
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-[var(--yellow)]" />
            ) : (
              <Bookmark className="h-4 w-4 text-[var(--cream)]" />
            )}
          </button>

          {merch.isUpcoming && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--cream)]">
              Upcoming Drop
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-['Orbitron'] text-sm font-bold leading-snug tracking-wide text-[var(--cream)]">
              {merch.name}
            </h3>
            {merch.category && (
              <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {merch.category}
              </span>
            )}
          </div>

          {(merch.tags?.length || 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {merch.tags.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-surface-light/70 px-2 py-0.5 text-[10px] text-[var(--cream)]"
                >
                  {t}
                </span>
              ))}
              {merch.tags.length > 3 && (
                <span className="rounded-full px-1 py-0.5 text-[10px] text-[var(--muted)]">
                  +{merch.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.article>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
}
