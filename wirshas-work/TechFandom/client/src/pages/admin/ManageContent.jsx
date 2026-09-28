import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const CATEGORIES = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const TYPES = ["article", "video", "audio", "image"];
const TYPE_LABELS = { article: "Article", video: "Video", audio: "Audio", image: "Image" };

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
    key: "popularity",
    label: "Popularity",
    render: (c) => {
      const v = c.popularity ?? c.popularityScore ?? 0;
      const pct = Math.min(100, Math.max(0, v));
      const hue = Math.round((pct / 100) * 160);
      const glow = `0 0 6px hsla(${hue}, 100%, 60%, 0.9), 0 0 16px hsla(${(hue + 60) % 360}, 100%, 65%, 0.55)`;
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-light)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #FF006B, #FFE347, #00E5FF)",
                boxShadow: glow,
              }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: `hsl(${hue}, 100%, 70%)` }}>
            {v}
          </span>
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
  { name: "popularity", label: "Popularity Score (0–100)", type: "number", step: "1", placeholder: "0" },
];

export default function ManageContent() {
  return (
    <CrudManager
      resource="admin/content"
      title="CONTENT"
      subtitle="General hub content across articles, videos, audio and images."
      columns={columns}
      fields={fields}
      filters={[
        { type: "chips", key: "category", options: CATEGORIES, allLabel: "All Categories" },
        { type: "select", key: "type", label: "Type", options: TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] })) },
      ]}
      transformSubmit={(p) => ({
        ...p,
        popularity: p.popularity === undefined || p.popularity === "" ? 0 : Math.max(0, Math.min(100, Number(p.popularity) || 0)),
      })}
      emptyMessage="No content yet — add your first drop!"
    />
  );
}
