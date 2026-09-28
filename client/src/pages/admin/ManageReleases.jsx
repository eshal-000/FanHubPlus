import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const RELEASE_TYPES = ["anime", "game", "movie", "show", "comic", "merch"];
const STATUSES = ["upcoming", "released", "delayed"];
const STATUS_TONE = { upcoming: "yellow", released: "primary", delayed: "muted" };

const columns = [
  {
    key: "title",
    label: "Title",
    render: (r) => <span className="font-medium">{r.title}</span>,
  },
  { key: "releaseType", label: "Type", render: (r) => <Pill value={r.releaseType} tone="primary" /> },
  { key: "fandom", label: "Fandom", render: (r) => <Pill value={r.fandom} /> },
  { key: "category", label: "Category" },
  { key: "releaseDate", label: "Release Date", render: (r) => fmtDate(r.releaseDate) },
  { key: "status", label: "Status", render: (r) => <Pill value={r.status} tone={STATUS_TONE[r.status] || "surface"} /> },
];

const fields = [
  { name: "title", label: "Release Title", required: true, placeholder: "e.g. Neon Requiem Vol. 2", colSpan: 2 },
  { name: "releaseType", label: "Release Type", type: "select", required: true, options: RELEASE_TYPES },
  { name: "status", label: "Status", type: "select", required: true, options: STATUSES, default: "upcoming" },
  { name: "fandom", label: "Fandom", type: "select", required: true, options: ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"] },
  { name: "category", label: "Category", required: true, placeholder: "e.g. Sequel, Season 2, DLC" },
  { name: "releaseDate", label: "Release Date", type: "date", required: true },
  { name: "imageUrl", label: "Poster / Cover URL", type: "url", colSpan: 2, placeholder: "https://…" },
  { name: "externalUrl", label: "External URL", type: "url", colSpan: 2, placeholder: "https://watch or buy link…" },
];

export default function ManageReleases() {
  return (
    <CrudManager
      resource="admin/releases"
      title="RELEASES"
      subtitle="Track anime, games, movies, shows and comics drops."
      columns={columns}
      fields={fields}
      filters={[
        { type: "chips", key: "releaseType", options: RELEASE_TYPES, allLabel: "All Types" },
        { type: "select", key: "status", label: "Status", options: STATUSES },
      ]}
      emptyMessage="No releases tracked yet — add the next big drop!"
    />
  );
}
