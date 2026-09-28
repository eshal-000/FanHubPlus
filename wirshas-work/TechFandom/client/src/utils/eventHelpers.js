import { Clapperboard, Drama, Film, Star } from "lucide-react";

export const EVENT_TYPE_STYLES = {
  "cosplay-meetup": {
    icon: Drama,
    pill: "bg-primary/20 text-[var(--cream)] border border-[var(--border)]",
    badge: "bg-[var(--primary)] text-[var(--cream)]",
  },
  screening: {
    icon: Film,
    pill: "bg-[var(--surface-light)] text-[var(--cream)] border border-[var(--border)]",
    badge: "bg-[var(--surface-light)] text-[var(--cream)]",
  },
  convention: {
    icon: Star,
    pill: "bg-yellow/90 text-[var(--bg)]",
    badge: "bg-[var(--yellow)] text-[var(--bg)]",
  },
  premiere: {
    icon: Clapperboard,
    pill: "bg-[var(--raspberry)] text-[var(--cream)]",
    badge: "bg-[var(--raspberry)] text-[var(--cream)]",
  },
};

export function eventStatus(event, now = new Date()) {
  const start = event?.startDate ? new Date(event.startDate) : null;
  const end = event?.endDate ? new Date(event.endDate) : start;

  if (!start) return { key: "upcoming", label: "TBA" };
  if (end && end < now) return { key: "past", label: "Past" };
  if (start <= now && (!end || end >= now)) return { key: "live", label: "Live Now" };
  return { key: "upcoming", label: "Upcoming" };
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
