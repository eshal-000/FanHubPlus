import { motion } from "framer-motion";
import { CalendarClock, Clock3 } from "lucide-react";

const TYPE_PILL = {
  anime: "bg-[var(--primary)]/20 text-[var(--cream)] border border-[var(--border)]",
  game: "bg-[var(--surface-light)] text-[var(--cream)] border border-[var(--border)]",
  movie: "bg-[var(--raspberry)] text-[var(--cream)]",
  show: "bg-[var(--primary)]/20 text-[var(--cream)] border border-[var(--border)]",
  comic: "bg-[var(--yellow)]/90 text-[var(--bg)]",
  merch: "bg-[var(--surface-light)] text-[var(--cream)] border border-[var(--border)]",
};

const STATUS_BADGE = {
  upcoming: "bg-[var(--yellow)] text-[var(--bg)]",
  released: "bg-[var(--primary)] text-[var(--cream)]",
  delayed: "bg-[var(--surface-light)] text-[var(--muted)] border border-[var(--border)]",
};

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export default function ReleaseCard({ release, index = 0, onOpen }) {
  const typePill = TYPE_PILL[release.releaseType] || TYPE_PILL.anime;
  const statusBadge = STATUS_BADGE[release.status] || STATUS_BADGE.upcoming;
  const days = daysUntil(release.releaseDate);

  const countdown =
    release.status === "released" ? "Out now"
    : days === null ? "Date TBA"
    : days === 0 ? "Out today"
    : days > 0 ? `in ${days} day${days === 1 ? "" : "s"}`
    : "Delayed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      onClick={() => onOpen?.(release)}
      onKeyDown={(e) => e.key === "Enter" && onOpen?.(release)}
      role="link"
      tabIndex={0}
      aria-label={`Release: ${release.title}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 shadow-[0_0_20px_var(--glow)] backdrop-blur-md transition-shadow hover:shadow-[0_0_30px_var(--glow)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface-light)]">
        {release.imageUrl ? (
          <motion.img
            src={release.imageUrl}
            alt={`${release.title} — ${release.releaseType} release poster`}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.45 }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-['Orbitron'] text-3xl text-[var(--muted)]/30">
            {release.title?.[0]?.toUpperCase() || "?"}
          </span>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}
        >
          {release.status || "upcoming"}
        </span>

        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-[var(--nav)]/80 px-2 py-0.5 text-[10px] font-semibold text-[var(--yellow)] backdrop-blur-md">
          <Clock3 className="h-3 w-3" /> {countdown}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-['Orbitron'] text-sm font-bold leading-snug tracking-wide text-[var(--cream)]">
            {release.title}
          </h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${typePill}`}>
            {release.releaseType}
          </span>
        </div>

        <p className="mt-1.5 text-xs text-[var(--muted)]">
          {release.fandom || "Multi-fandom"}
          {release.category ? ` · ${release.category}` : ""}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-[var(--muted)]">
          <CalendarClock className="h-3.5 w-3.5 text-[var(--primary)]" />
          {release.releaseDate
            ? new Date(release.releaseDate).toLocaleDateString(undefined, { dateStyle: "medium" })
            : "TBA"}
        </div>
      </div>
    </motion.article>
  );
}
