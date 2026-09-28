import CrudManager from "@/components/admin/CrudManager";

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];

const columns = [
  {
    key: "name",
    label: "Name",
    render: (c) => (
      <div className="flex items-center gap-3">
        {c.image ? (
          <img
            src={c.image}
            alt={`${c.name} portrait`}
            className="h-9 w-9 rounded-full border border-[var(--border)] object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-light)] font-['Orbitron'] text-xs text-[var(--yellow)]">
            {c.name?.[0]?.toUpperCase() || "?"}
          </span>
        )}
        <span className="font-medium">{c.name}</span>
      </div>
    ),
  },
  { key: "fandom", label: "Fandom", render: (c) => <Badgeish value={c.fandom} /> },
  { key: "category", label: "Category" },
  { key: "traits", label: "Traits", render: (c) => truncate(c.traits) },
  {
    key: "createdAt",
    label: "Added",
    render: (c) => (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"),
  },
];

const fields = [
  { name: "name", label: "Character Name", required: true, placeholder: "e.g. Zara Vale" },
  { name: "fandom", label: "Fandom", type: "select", required: true, options: FANDOMS },
  { name: "category", label: "Category", required: true, placeholder: "e.g. Protagonist, Villain, Idol" },
  { name: "image", label: "Image URL", type: "url", placeholder: "https://…", colSpan: 2 },
  { name: "bio", label: "Bio", type: "textarea", colSpan: 2, rows: 3, placeholder: "Short character bio…" },
  { name: "traits", label: "Traits", type: "tags", colSpan: 2, placeholder: "Brave, Witty, Loyal" },
];

export default function ManageCharacters() {
  return (
    <CrudManager
      resource="characters"
      title="CHARACTERS"
      subtitle="Create, edit and remove characters from every fandom."
      columns={columns}
      fields={fields}
      emptyMessage="No characters yet — add your first fandom icon!"
    />
  );
}

function Badgeish({ value }) {
  if (!value) return <span className="text-[var(--muted)]">—</span>;
  return (
    <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--surface-light)]/60 px-2.5 py-0.5 text-xs text-[var(--cream)]">
      {value}
    </span>
  );
}

function truncate(value) {
  const text = Array.isArray(value) ? value.join(", ") : value;
  if (!text) return <span className="text-[var(--muted)]">—</span>;
  return (
    <span className="block max-w-[220px] truncate text-[var(--muted)]" title={text}>
      {text}
    </span>
  );
}
