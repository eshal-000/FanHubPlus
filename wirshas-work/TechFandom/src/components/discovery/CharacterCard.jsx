import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, User as UserIcon } from "lucide-react";
import useBookmarks from "@/hooks/useBookmarks";
import LoginPromptModal from "@/components/common/LoginPromptModal";

export default function CharacterCard({ character, index = 0 }) {
  const navigate = useNavigate();
  const { isBookmarked, toggle, requireLogin, showLoginPrompt, closeLoginPrompt } = useBookmarks();

  const saved = isBookmarked(character._id);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (requireLogin()) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await toggle(character._id, "character");
    } catch {
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
        whileHover={{ y: -6, scale: 1.02 }}
        onClick={() => navigate(`/characters/${character._id}`)}
        className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 shadow-[0_0_20px_var(--glow)] backdrop-blur-md transition-shadow hover:shadow-[0_0_30px_var(--glow)]"
        role="link"
        tabIndex={0}
        aria-label={`View ${character.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate(`/characters/${character._id}`);
        }}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-light)]">
          {character.image ? (
            <motion.img
              src={character.image}
              alt={`${character.name} — ${character.fandom || "fandom"} character`}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.07 }}
              transition={{ duration: 0.45 }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <UserIcon className="h-12 w-12 text-[var(--muted)]/50" />
            </span>
          )}

          {character.fandom && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--yellow)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bg)]">
              {character.fandom}
            </span>
          )}

          <button
            type="button"
            onClick={handleBookmark}
            aria-label={saved ? `Remove ${character.name} from bookmarks` : `Bookmark ${character.name}`}
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

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-['Orbitron'] text-sm font-bold tracking-wide text-[var(--cream)]">
              {character.name}
            </h3>
            {character.category && (
              <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {character.category}
              </span>
            )}
          </div>

          {character.bio && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {character.bio.replace(/<[^>]*>/g, "")}
            </p>
          )}
        </div>
      </motion.article>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
}
