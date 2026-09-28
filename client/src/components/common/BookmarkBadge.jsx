import { motion, AnimatePresence } from "framer-motion";
import { BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import useBookmarks from "@/hooks/useBookmarks";

export default function BookmarkBadge() {
  const { bookmarkCount, isLoggedIn } = useBookmarks();

  return (
    <AnimatePresence>
      {isLoggedIn && bookmarkCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <Link
            to="/bookmarks"
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-nav/80 px-4 py-2 text-xs font-semibold text-[var(--cream)] shadow-[0_0_20px_var(--glow)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--glow)]"
            title="Your saved items"
          >
            <BookmarkCheck className="h-4 w-4 text-[var(--yellow)]" />
            <span className="font-['Orbitron'] tracking-wider">{bookmarkCount}</span>
            <span className="text-[var(--muted)]">saved</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
