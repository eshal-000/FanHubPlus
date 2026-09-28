import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarRange,
  LayoutList,
  Locate,
  Map as MapIcon,
  SearchX,
  History,
  Radio,
  CalendarClock,
  Sparkles,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventMap from "@/components/discovery/EventMap";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import BookmarkBadge from "@/components/common/BookmarkBadge";
import { distanceKm } from "@/utils/eventHelpers";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];
const EVENT_TYPES = ["convention", "premiere", "screening", "cosplay-meetup"];
const TIME_FILTERS = [
  { value: "past", label: "Past", icon: History, color: "#99004D", desc: "Events that already happened" },
  { value: "live", label: "Live Now", icon: Radio, color: "#FF006B", desc: "Happening right now" },
  { value: "upcoming", label: "Upcoming", icon: CalendarClock, color: "#FFE347", desc: "Coming up soon" },
];

const EVENT_TYPE_META = {
  convention: { color: "#FFE347", label: "Convention" },
  premiere: { color: "#FF006B", label: "Premiere" },
  screening: { color: "#7DD3FC", label: "Screening" },
  "cosplay-meetup": { color: "#F5B8FF", label: "Cosplay Meetup" },
};

function GlowBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--primary)] opacity-[0.12] blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 top-1/3 h-[450px] w-[450px] rounded-full bg-[var(--raspberry)] opacity-[0.14] blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-[var(--yellow)] opacity-[0.08] blur-[110px]"
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function TimeTravelTimeline({ value, onChange }) {
  const activeIndex = TIME_FILTERS.findIndex((t) => t.value === value);

  return (
    <div className="flex items-stretch gap-6">
      <div className="relative flex flex-col items-center justify-between py-2">
        <div className="absolute left-1/2 top-2 bottom-2 w-0.5 -translate-x-1/2 bg-[var(--surface-light)]" />
        <motion.div
          className="absolute left-1/2 top-2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[var(--primary)] via-[var(--raspberry)] to-[var(--yellow)]"
          animate={{
            height: `calc(${(activeIndex / (TIME_FILTERS.length - 1)) * 100}% - ${activeIndex === 0 ? 0 : 8}px)`,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ boxShadow: "0 0 12px var(--glow)" }}
        />

        {TIME_FILTERS.map((tf, i) => {
          const isActive = i === activeIndex;
          const isPassed = i < activeIndex;
          const Icon = tf.icon;

          return (
            <button
              key={tf.value}
              onClick={() => onChange(tf.value)}
              aria-pressed={isActive}
              className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all"
              style={{
                borderColor: isActive ? tf.color : "var(--border)",
                background: isActive ? tf.color : "var(--nav)",
                boxShadow: isActive
                  ? `0 0 24px ${tf.color}80, 0 0 8px ${tf.color}`
                  : isPassed
                  ? `0 0 12px ${tf.color}40`
                  : "none",
              }}
            >
              <Icon className="h-4 w-4" style={{ color: isActive ? "#230018" : "var(--muted)" }} />
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col justify-between py-2">
        {TIME_FILTERS.map((tf, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={tf.value}
              onClick={() => onChange(tf.value)}
              aria-pressed={isActive}
              className="flex flex-col items-start text-left transition-all"
            >
              <span
                className={`font-['Orbitron'] text-sm font-bold tracking-wider transition-colors sm:text-base ${
                  isActive ? "text-[var(--cream)]" : "text-[var(--muted)] hover:text-[var(--cream)]"
                }`}
                style={isActive ? { color: tf.color } : undefined}
              >
                {tf.label.toUpperCase()}
              </span>
              <span
                className={`text-[10px] uppercase tracking-widest transition-colors ${
                  isActive ? "text-[var(--cream)]/70" : "text-[var(--muted)]/60"
                }`}
              >
                {tf.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EnhancedEventCard({ event, index, distanceKm: dist }) {
  const navigate = useNavigate();
  const meta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.convention;
  const image =
    event.imageUrl ||
    event.image ||
    event.imageUrls?.[0] ||
    "https://picsum.photos/seed/event/800/450";

  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  const formatDate = (d) =>
    d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "";

  const dateRange = start && end
    ? `${formatDate(start)} → ${formatDate(end)}`
    : start
    ? formatDate(start)
    : "Date TBA";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/events/${event._id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/events/${event._id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[var(--border)] bg-surface/40 backdrop-blur-xl transition-all hover:border-[var(--primary)]/40"
      style={{ boxShadow: "0 0 30px rgba(255, 0, 107, 0.05)" }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at 20% 50%, ${meta.color}15, transparent 60%)`,
        }}
      />

      <span
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
        style={{
          background: `linear-gradient(to bottom, ${meta.color}, transparent)`,
          boxShadow: `0 0 20px ${meta.color}80`,
        }}
      />

      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl sm:aspect-square sm:h-40 sm:w-40">
          <img
            src={image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
            style={{
              background: `${meta.color}30`,
              color: meta.color,
              border: `1px solid ${meta.color}80`,
            }}
          >
            {event.status || "Upcoming"}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `${meta.color}20`,
                  color: meta.color,
                  border: `1px solid ${meta.color}50`,
                }}
              >
                {meta.label}
              </span>
              {dist != null && (
                <span className="rounded-full border border-[var(--border)] bg-nav/60 px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">
                  📍 {dist.toFixed(0)} km
                </span>
              )}
            </div>

            <h3 className="font-['Orbitron'] text-lg font-bold leading-snug tracking-wide text-[var(--cream)] sm:text-xl">
              {event.title}
            </h3>

            <div className="mt-3 flex flex-col gap-1.5 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--primary)]" />
                {dateRange}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--yellow)]" />
                {event.city}
              </span>
            </div>
          </div>

          {event.ticketUrl && (
            <div className="flex justify-end pt-2">
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:bg-[var(--raspberry)] hover:scale-105"
              >
                <Ticket className="h-3.5 w-3.5" />
                Tickets
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CalendarView({ events, onSelect }) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!ev.startDate) continue;
      const d = new Date(ev.startDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const key = d.getDate();
      (map[key] = map[key] || []).push(ev);
    }
    return map;
  }, [events, year, month]);

  const cells = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <motion.div
      key={`${year}-${month}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-[var(--border)] bg-surface/40 p-5 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={() => setCursor(new Date(year, month - 1, 1))} className="text-[var(--muted)] hover:text-[var(--cream)]">
          ← Prev
        </Button>
        <p className="font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <Button size="sm" variant="ghost" onClick={() => setCursor(new Date(year, month + 1, 1))} className="text-[var(--muted)] hover:text-[var(--cream)]">
          Next →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div key={i} className="min-h-[64px] rounded-lg border border-[var(--border)] bg-nav/40 p-1 sm:min-h-[80px]">
            {day && (
              <>
                <span className="text-[10px] text-[var(--muted)]">{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {(byDay[day] || []).slice(0, 2).map((ev) => (
                    <button
                      key={ev._id}
                      onClick={() => onSelect(ev)}
                      className="block w-full truncate rounded bg-primary/25 px-1 py-0.5 text-left text-[9px] text-[var(--cream)] hover:bg-primary/45"
                    >
                      {ev.title}
                    </button>
                  ))}
                  {(byDay[day] || []).length > 2 && (
                    <span className="block text-[8px] text-[var(--muted)]">
                      +{byDay[day].length - 2} more
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-surface/40 sm:flex-row sm:items-stretch">
      <div className="aspect-square w-full animate-pulse bg-surface-light/50 sm:h-40 sm:w-40" />
      <div className="flex-1 space-y-3 p-6">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-light/70" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-light/50" />
        <div className="h-2.5 w-1/4 animate-pulse rounded bg-surface-light/50" />
      </div>
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list");
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [city, setCity] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [userLoc, setUserLoc] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (city !== "all") params.city = city;
        if (eventType !== "all") params.eventType = eventType;
        params.timeFilter = timeFilter;

        const { data } = await axios.get(`${API}/events`, { params });
        setEvents(Array.isArray(data) ? data : data?.items || data?.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load events.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [city, eventType, timeFilter]);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Location permission denied — showing all events.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const visibleEvents = useMemo(() => {
    if (!userLoc) return events;
    return [...events]
      .map((e) => {
        const lat = e.lat ?? e.location?.coordinates?.[1];
        const lng = e.long ?? e.lng ?? e.location?.coordinates?.[0];
        return {
          ...e,
          _distance:
            Number.isFinite(+lat) && Number.isFinite(+lng)
              ? distanceKm(userLoc.lat, userLoc.lng, +lat, +lng)
              : null,
        };
      })
      .sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity));
  }, [events, userLoc]);

  const openEvent = (ev) => navigate(`/events/${ev._id}`);

  return (
    <div className="relative min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <Breadcrumbs />
          <BookmarkBadge />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-[var(--yellow)]" />
            <span className="font-['Orbitron'] text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Fandom Universe
            </span>
          </div>
          <h1 className="font-['Orbitron'] text-4xl font-bold tracking-wide sm:text-5xl">
            COSPLAY{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--primary)]">CONNECT</span>
              <motion.span
                className="absolute inset-0 z-0 blur-xl bg-[var(--primary)] opacity-60"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            Conventions, premieres, screenings and meetups — travel through time to find yours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-surface/40 p-5 backdrop-blur-xl sm:p-7"
          style={{ boxShadow: "0 0 40px rgba(255, 0, 107, 0.08)" }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[var(--primary)] opacity-20 blur-[80px]" />

          <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full border border-[var(--border)] bg-nav/60 p-1 backdrop-blur-md">
              {[
                { key: "list", icon: LayoutList, label: "List" },
                { key: "calendar", icon: CalendarRange, label: "Calendar" },
                { key: "map", icon: MapIcon, label: "Map" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  aria-pressed={view === v.key}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    view === v.key
                      ? "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)]"
                      : "text-[var(--muted)] hover:text-[var(--cream)]"
                  }`}
                >
                  <v.icon className="h-3.5 w-3.5" /> {v.label}
                </button>
              ))}
            </div>

            <Button
              onClick={handleNearMe}
              disabled={locating}
              size="sm"
              className={`${
                userLoc
                  ? "bg-[var(--surface-light)] text-[var(--yellow)]"
                  : "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)]"
              } hover:bg-[var(--raspberry)]`}
            >
              <Locate className={`mr-1.5 h-3.5 w-3.5 ${locating ? "animate-pulse" : ""}`} />
              {locating ? "Locating…" : userLoc ? "Sorted Near You" : "Near Me"}
            </Button>
          </div>

          <div className="relative mb-6">
            <p className="mb-4 font-['Orbitron'] text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              ⏳ Time-Travel
            </p>
            <TimeTravelTimeline value={timeFilter} onChange={setTimeFilter} />
          </div>

          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)]">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All cities</SelectItem>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="border-[var(--border)] bg-nav/60 text-[var(--cream)]">
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)]">
                <SelectItem value="all">All event types</SelectItem>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-surface/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">
              NO EVENTS {timeFilter.toUpperCase()}
            </p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              {timeFilter === "live"
                ? "Nothing is happening right this second — check Upcoming."
                : "Try a different time period, city or event type."}
            </p>
          </motion.div>
        ) : view === "list" ? (
          <motion.div layout className="space-y-5">
            <AnimatePresence mode="popLayout">
              {visibleEvents.map((ev, i) => (
                <EnhancedEventCard key={ev._id} event={ev} index={i} distanceKm={ev._distance} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : view === "calendar" ? (
          <CalendarView events={visibleEvents} onSelect={openEvent} />
        ) : (
          <EventMap events={visibleEvents} height="520px" />
        )}
      </div>
    </div>
  );
}