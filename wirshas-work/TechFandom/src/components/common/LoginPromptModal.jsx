import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPromptModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--nav)]/80 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Login required"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_0_20px_var(--glow)]"
          >
            <button
              onClick={onClose}
              aria-label="Close login prompt"
              className="absolute right-3 top-3 text-[var(--muted)] hover:text-[var(--cream)]"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] shadow-[0_0_20px_var(--glow)]">
              <Bookmark className="h-6 w-6 text-[var(--cream)]" />
            </span>

            <h2 className="font-['Orbitron'] text-lg font-bold tracking-wide text-[var(--cream)]">
              SAVE YOUR FAVES
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Log in to bookmark characters, articles, media and merch — they'll be waiting on
              every device.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Button asChild className="bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Log In
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[var(--border)] bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]"
              >
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
