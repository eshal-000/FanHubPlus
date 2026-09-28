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
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventCard from "@/components/discovery/EventCard";
import EventMap from "@/components/discovery/EventMap";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { eventStatus, distanceKm } from "@/utils/eventHelpers";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];
const EVENT_TYPES = ["convention", "premiere", "screening", "cosplay-meetup"];
const TIME_FILTERS = [
  { value: "past", label: "Past" },
  { value: "live", label: "Live Now" },
  { value: "upcoming", label: "Upcoming" },
];

function CalendarView({ events, onSelect }) {
  const [cursor, setCursor] = useState(() => new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = Sun
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
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="text-[var(--muted)] hover:text-[var(--cream)]"
        >
          ← Prev
        </Button>
        <p className="font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="text-[var(--muted)] hover:text-[var(--cream)]"
        >
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
          <div
            key={i}
            className="min-h-[64px] rounded-lg border border-[var(--border)] bg-[var(--nav)]/40 p-1 sm:min-h-[80px]"
          >
            {day && (
              <>
                <span className="text-[10px] text-[var(--muted)]">{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {(byDay[day] || []).slice(0, 2).map((ev) => (
                    <button
                      key={ev._id}
                      onClick={() => onSelect(ev)}
                      className="block w-full truncate rounded bg-[var(--primary)]/25 px-1 py-0.5 text-left text-[9px] text-[var(--cream)] hover:bg-[var(--primary)]/45"
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 sm:flex-row">
      <div className="aspect-video animate-pulse bg-[var(--surface-light)]/50 sm:w-56" />
      <div className="flex-1 space-y-2 p-4">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-[var(--surface-light)]/70" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-[var(--surface-light)]/50" />
        <div className="h-2.5 w-1/4 animate-pulse rounded bg-[var(--surface-light)]/50" />
      </div>
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list"); // list | calendar | map
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [city, setCity] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [userLoc, setUserLoc] = useState(null); // { lat, lng }
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
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="font-['Orbitron'] text-3xl font-bold tracking-wide">
            COSPLAY <span className="text-[var(--primary)]">CONNECT</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Conventions, premieres, screenings and meetups — travel through time to find yours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full border border-[var(--border)] bg-[var(--nav)]/60 p-1">
              {[
                { key: "list", icon: LayoutList, label: "List" },
                { key: "calendar", icon: CalendarRange, label: "Calendar" },
                { key: "map", icon: MapIcon, label: "Map" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  aria-pressed={view === v.key}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
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

          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              <SlidersHorizontal className="h-3 w-3" /> Time-Travel
            </p>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--surface-light)]" />
              <motion.div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--primary)]"
                animate={{ width: `${((TIME_FILTERS.findIndex((t) => t.value === timeFilter) + 1) / TIME_FILTERS.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              />
              <motion.div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--yellow)] shadow-[0_0_20px_var(--glow)]"
                animate={{ left: `calc(${(TIME_FILTERS.findIndex((t) => t.value === timeFilter) / (TIME_FILTERS.length - 1)) * 100}% - 8px)` }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              />
              <div className="relative flex justify-between">
                {TIME_FILTERS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeFilter(t.value)}
                    aria-pressed={timeFilter === t.value}
                    className={`relative z-10 flex-1 px-2 py-3 text-xs font-semibold transition-colors ${
                      timeFilter === t.value
                        ? t.value === "live"
                          ? "text-[var(--primary)]"
                          : "text-[var(--cream)]"
                        : "text-[var(--muted)] hover:text-[var(--cream)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
              <SelectTrigger className="border-[var(--border)] bg-[var(--nav)]/60 text-[var(--cream)]">
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
          <div className="mb-6 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center backdrop-blur-md"
          >
            <SearchX className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-['Orbitron'] text-sm tracking-wider">NO EVENTS {timeFilter.toUpperCase()}</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              {timeFilter === "live"
                ? "Nothing is happening right this second — check Upcoming."
                : "Try a different time period, city or event type."}
            </p>
          </motion.div>
        ) : view === "list" ? (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visibleEvents.map((ev, i) => (
                <EventCard key={ev._id} event={ev} index={i} distanceKm={ev._distance} />
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
