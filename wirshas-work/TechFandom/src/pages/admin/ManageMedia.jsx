import CrudManager, { Pill, TagList, fmtDate } from "@/components/admin/CrudManager";

const MEDIA_TYPES = ["video", "audio", "explainer"];

const columns = [
  {
    key: "title",
    label: "Title",
    render: (m) => (
      <div className="flex items-center gap-3">
        {m.thumbnailUrl ? (
          <img
            src={m.thumbnailUrl}
            alt={`${m.title} thumbnail`}
            className="h-9 w-14 rounded-md border border-[var(--border)] object-cover"
          />
        ) : (
          <span className="flex h-9 w-14 items-center justify-center rounded-md bg-[var(--surface-light)] text-[10px] font-['Orbitron'] text-[var(--muted)]">
            N/A
          </span>
        )}
        <span className="font-medium">{m.title}</span>
      </div>
    ),
  },
  { key: "mediaType", label: "Type", render: (m) => <Pill value={m.mediaType} tone="yellow" /> },
  { key: "fandom", label: "Fandom", render: (m) => <Pill value={m.fandom} /> },
  { key: "category", label: "Category" },
  { key: "tags", label: "Tags", render: (m) => <TagList value={m.tags} /> },
];

const fields = [
  { name: "title", label: "Title", required: true, placeholder: "Media title", colSpan: 2 },
  { name: "mediaType", label: "Media Type", type: "select", required: true, options: MEDIA_TYPES },
  { name: "fandom", label: "Fandom", type: "select", required: true, options: ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"] },
  { name: "category", label: "Category", required: true, placeholder: "e.g. Trailer, Podcast, Lore Explainer" },
  { name: "releaseYear", label: "Release Year", type: "number", step: "1", placeholder: "2026" },
  { name: "embedUrl", label: "Embed URL", type: "url", required: true, colSpan: 2, placeholder: "https://youtube.com/embed/… or audio URL" },
  { name: "thumbnailUrl", label: "Thumbnail URL", type: "url", colSpan: 2, placeholder: "https://…" },
  { name: "tags", label: "Tags", type: "tags", colSpan: 2, placeholder: "trailer, official, hd" },
];

export default function ManageMedia() {
  return (
    <CrudManager
      resource="media"
      title="MEDIA"
      subtitle="Videos, audio and explainers with embeds and tag organization."
      columns={columns}
      fields={fields}
      transformSubmit={(p) => ({
        ...p,
        releaseYear: p.releaseYear === "" || p.releaseYear === undefined ? undefined : Number(p.releaseYear),
      })}
      emptyMessage="No media yet — upload your first embed!"
    />
  );
}
