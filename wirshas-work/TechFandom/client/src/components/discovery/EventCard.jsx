import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ExternalLink, MapPin, Navigation } from "lucide-react";
import { EVENT_TYPE_STYLES, eventStatus } from "@/utils/eventHelpers";

export default function EventCard({ event, index = 0, distanceKm }) {
  const navigate = useNavigate();
  const status = eventStatus(event);
  const styles = EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.convention;

  const open = () => navigate(`/events/${event._id}`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      role="link"
      tabIndex={0}
      aria-label={`View event: ${event.title}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/40 shadow-[0_0_20px_var(--glow)] backdrop-blur-md transition-shadow hover:shadow-[0_0_30px_var(--glow)] sm:flex-row"
    >
      {}
      <div className="relative aspect-video overflow-hidden bg-[var(--surface-light)] sm:aspect-auto sm:w-56 sm:shrink-0">
        {event.imageUrl ? (
          <motion.img
            src={event.imageUrl}
            alt={`${event.title} — ${event.eventType} in ${event.city || "your area"}`}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.45 }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <styles.icon className="h-10 w-10 text-muted/40" />
          </span>
        )}
        {}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
        >
          {status.label}
        </span>
        {typeof distanceKm === "number" && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-nav/80 px-2 py-0.5 text-[10px] text-[var(--cream)] backdrop-blur-md">
            <Navigation className="h-3 w-3 text-[var(--yellow)]" /> {distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      {}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-['Orbitron'] text-sm font-bold leading-snug tracking-wide text-[var(--cream)]">
            {event.title}
          </h3>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${styles.pill}`}
          >
            <styles.icon className="h-3 w-3" /> {event.eventType}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
            {event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Date TBA"}
            {event.endDate && new Date(event.endDate) > new Date(event.startDate)
              ? ` → ${new Date(event.endDate).toLocaleDateString(undefined, { dateStyle: "medium" })}`
              : ""}
          </p>
          {event.city && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" /> {event.city}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-end pt-3">
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--cream)] transition-colors hover:bg-[var(--raspberry)]"
            >
              Tickets <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
