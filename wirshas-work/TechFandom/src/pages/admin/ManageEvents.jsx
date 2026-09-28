import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const EVENT_TYPES = ["convention", "premiere", "screening", "cosplay-meetup"];

const TYPE_TONE = {
  convention: "yellow",
  premiere: "primary",
  screening: "surface",
  "cosplay-meetup": "muted",
};

const columns = [
  {
    key: "title",
    label: "Title",
    render: (e) => <span className="font-medium">{e.title}</span>,
  },
  { key: "eventType", label: "Type", render: (e) => <Pill value={e.eventType} tone={TYPE_TONE[e.eventType] || "surface"} /> },
  { key: "city", label: "City", render: (e) => <Pill value={e.city} tone="muted" /> },
  { key: "startDate", label: "Starts", render: (e) => fmtDate(e.startDate) },
  {
    key: "ticketUrl",
    label: "Tickets",
    render: (e) =>
      e.ticketUrl ? (
        <a
          href={e.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[var(--yellow)] underline-offset-2 hover:underline"
        >
          Ticket link ↗
        </a>
      ) : (
        <span className="text-[var(--muted)]">—</span>
      ),
  },
];

const fields = [
  { name: "title", label: "Event Title", required: true, placeholder: "e.g. Starfall Con 2026", colSpan: 2 },
  { name: "eventType", label: "Event Type", type: "select", required: true, options: EVENT_TYPES },
  { name: "ticketUrl", label: "Ticket URL", type: "url", placeholder: "https://tickets…" },
  { name: "city", label: "City", required: true, placeholder: "e.g. Lahore" },
  { name: "address", label: "Address", placeholder: "Venue / street address" },
  { name: "startDate", label: "Start Date", type: "date", required: true },
  { name: "endDate", label: "End Date", type: "date" },
  { name: "lat", label: "Latitude", type: "number", step: "any", placeholder: "31.5204" },
  { name: "long", label: "Longitude", type: "number", step: "any", placeholder: "74.3587" },
  { name: "story", label: "Story / Description", type: "textarea", rows: 4, colSpan: 2, placeholder: "What fans can expect…" },
  { name: "imageUrl", label: "Event Image URL", type: "url", colSpan: 2, placeholder: "https://…" },
];

export default function ManageEvents() {
  return (
    <CrudManager
      resource="events"
      title="EVENTS"
      subtitle="Conventions, premieres, screenings and cosplay meetups with map coordinates."
      columns={columns}
      fields={fields}
      transformSubmit={(p) => ({
        ...p,
        lat: p.lat === "" || p.lat === undefined ? undefined : Number(p.lat),
        long: p.long === "" || p.long === undefined ? undefined : Number(p.long),
      })}
      emptyMessage="No events yet — schedule your first meetup!"
    />
  );
}
