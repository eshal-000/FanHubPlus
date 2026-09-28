import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const CATEGORIES = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const TYPES = ["article", "video", "audio", "image"];

const columns = [
  {
    key: "title",
    label: "Title",
    render: (c) => <span className="font-medium">{c.title}</span>,
  },
  { key: "category", label: "Category", render: (c) => <Pill value={c.category} /> },
  { key: "type", label: "Type", render: (c) => <Pill value={c.type} tone="primary" /> },
  { key: "releaseDate", label: "Release Year", render: (c) => (c.releaseDate ? new Date(c.releaseDate).getFullYear() : "—") },
  {
    key: "popularityScore",
    label: "Popularity",
    render: (c) => {
      const v = c.popularityScore ?? 0;
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-light)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${Math.min(100, v)}%` }}
            />
          </div>
          <span className="text-xs text-[var(--muted)]">{v}</span>
        </div>
      );
    },
  },
];

const fields = [
  { name: "title", label: "Title", required: true, placeholder: "Content title", colSpan: 2 },
  { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
  { name: "type", label: "Type", type: "select", required: true, options: TYPES },
  { name: "description", label: "Description", type: "textarea", rows: 4, colSpan: 2, placeholder: "What is this content about…" },
  { name: "releaseDate", label: "Release Date", type: "date" },
  { name: "popularityScore", label: "Popularity Score (0–100)", type: "number", step: "1", placeholder: "0" },
];

export default function ManageContent() {
  return (
    <CrudManager
      resource="content"
      title="CONTENT"
      subtitle="General hub content across articles, videos, audio and images."
      columns={columns}
      fields={fields}
      transformSubmit={(p) => ({
        ...p,
        popularityScore: p.popularityScore === undefined ? 0 : Math.max(0, Math.min(100, Number(p.popularityScore) || 0)),
      })}
      emptyMessage="No content yet — add your first drop!"
    />
  );
}
