import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, Sparkles, X } from "lucide-react";

export default function DemoLinkModal({ open, onClose, url, title }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-nav/85 p-4 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Demo link"
        >
          <motion.div
            initial={{ scale: 0.9, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_0_40px_var(--glow)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[var(--primary)] opacity-20 blur-[60px]"
            />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-light)] hover:text-[var(--cream)]"
            >
              <X className="h-4 w-4" />
            </button>

            <motion.span
              initial={{ rotate: -12, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.05 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-[0_0_24px_var(--glow)]"
            >
              <Sparkles className="h-6 w-6 text-[var(--cream)]" />
            </motion.span>

            <h2 className="font-['Orbitron'] text-lg font-bold tracking-wide text-[var(--cream)]">
              {title || "DEMO LINK"}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--muted)]">
              This showcase runs on demo data — the real page lives outside the hack. Here is
              where it would take you:
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-nav/70 px-3 py-2.5">
              <ExternalLink className="h-4 w-4 shrink-0 text-[var(--primary)]" />
              <span className="flex-1 truncate text-left text-xs text-[var(--cream)]">{url}</span>
              <button
                onClick={copy}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--surface-light)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--cream)] transition-all hover:bg-[var(--primary)]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-2.5 font-['Orbitron'] text-xs font-semibold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:-translate-y-0.5 hover:bg-[var(--raspberry)] hover:shadow-[0_0_30px_var(--glow)]"
            >
              OPEN ANYWAY <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
