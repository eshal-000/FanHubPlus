import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clapperboard,
  ExternalLink,
  MapPin,
  Ticket,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EventCard from "@/components/discovery/EventCard";
import EventMap from "@/components/discovery/EventMap";
import { EVENT_TYPE_STYLES, eventStatus } from "@/utils/eventHelpers";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading event">
      <div className="h-4 w-56 animate-pulse rounded bg-[var(--surface-light)]/60" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-video animate-pulse rounded-2xl bg-[var(--surface-light)]/50" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-[var(--surface-light)]/60" />
          <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-light)]/50" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-[var(--surface-light)]/40" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-[var(--surface-light)]/40" />
        </div>
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API}/events/${id}`);
        setEvent(data?.event || data);
        setRelatedEvents(data?.relatedEvents || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Event not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvent();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading)
    return <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans']"><DetailsSkeleton /></div>;

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
        <Clapperboard className="h-10 w-10 text-[var(--muted)]" />
        <p className="text-lg">{error || "Event not found."}</p>
        <Button
          onClick={() => navigate("/events")}
          className="bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]"
        >
          Back to Events
        </Button>
      </div>
    );
  }

  const status = eventStatus(event);
  const styles = EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.convention;
  const TypeIcon = styles.icon;

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Events", to: "/events" },
            { label: event.title, isLast: true },
          ]}
        />

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-[var(--muted)] hover:text-[var(--cream)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_20px_var(--glow)]"
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={`${event.title} — ${event.eventType} in ${event.city || "your city"}`}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-[var(--surface)]">
                <TypeIcon className="h-14 w-14 text-[var(--muted)]/40" />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase ${styles.pill}`}
              >
                <TypeIcon className="h-3.5 w-3.5" /> {event.eventType}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
              >
                {status.label}
              </span>
            </div>

            <h1 className="mt-4 font-['Orbitron'] text-2xl font-bold leading-tight tracking-wide sm:text-4xl">
              {event.title}
            </h1>

            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {event.startDate && (
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
                  {new Date(event.startDate).toLocaleString(undefined, {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                  {event.endDate &&
                    new Date(event.endDate) > new Date(event.startDate) && (
                      <span>
                        → {new Date(event.endDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    )}
                </p>
              )}
              {event.city && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--primary)]" />
                  {event.city}
                  {event.address ? ` — ${event.address}` : ""}
                </p>
              )}
            </div>

            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-['Orbitron'] text-sm font-semibold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:bg-[var(--raspberry)] hover:shadow-[0_0_30px_var(--glow)]"
              >
                <Ticket className="h-4 w-4" /> GET TICKETS
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
          aria-label="Event story"
        >
          <h2 className="font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">STORY</h2>
          <div
            className="prose prose-invert mt-3 max-w-none text-[var(--cream)]/90 [&_a]:text-[var(--primary)] [&_blockquote]:border-l-[var(--primary)] [&_h1]:font-['Orbitron'] [&_h2]:font-['Orbitron'] [&_h3]:font-['Orbitron'] [&_img]:rounded-xl [&_img]:shadow-[0_0_20px_var(--glow)] [&_li]:marker:text-[var(--primary)] [&_strong]:text-[var(--yellow)]"
            dangerouslySetInnerHTML={{
              __html: event.story || "<p>Story details coming soon.</p>",
            }}
          />
        </motion.section>

        <section className="mt-10" aria-label="Location">
          <h2 className="font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">LOCATION</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <EventMap events={[event]} height="320px" />
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md">
              <p className="flex items-start gap-2 text-sm text-[var(--cream)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <span>
                  {event.address || event.city || "Venue to be announced"}
                  {event.city && event.address ? (
                    <span className="block text-xs text-[var(--muted)]">{event.city}</span>
                  ) : null}
                </span>
              </p>
              {(event.lat || event.long) && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Coordinates: {event.lat?.toFixed?.(4) ?? event.lat}, {event.long?.toFixed?.(4) ?? event.long}
                </p>
              )}
            </div>
          </div>
        </section>

        {relatedEvents.length > 0 && (
          <section className="mt-12" aria-label="Related events">
            <h2 className="mb-4 font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
              RELATED EVENTS
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {relatedEvents.slice(0, 3).map((ev, i) => (
                <EventCard key={ev._id} event={ev} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
