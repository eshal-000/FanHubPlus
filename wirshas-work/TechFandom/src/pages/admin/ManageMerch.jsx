import CrudManager, { Pill, TagList } from "@/components/admin/CrudManager";

const columns = [
  {
    key: "name",
    label: "Name",
    render: (m) => {
      const img = (Array.isArray(m.images) && m.images[0]) || m.image;
      return (
        <div className="flex items-center gap-3">
          {img ? (
            <img
              src={img}
              alt={`${m.name} product photo`}
              className="h-9 w-9 rounded-md border border-[var(--border)] object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--surface-light)] font-['Orbitron'] text-xs text-[var(--yellow)]">
              {m.name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
          <span className="font-medium">{m.name}</span>
        </div>
      );
    },
  },
  { key: "fandom", label: "Fandom", render: (m) => <Pill value={m.fandom} /> },
  { key: "category", label: "Category" },
  { key: "tags", label: "Tags", render: (m) => <TagList value={m.tags} /> },
  {
    key: "isUpcoming",
    label: "Upcoming",
    render: (m) =>
      m.isUpcoming ? (
        <Pill value="Upcoming" tone="yellow" />
      ) : (
        <Pill value="Live" tone="primary" />
      ),
  },
];

const fields = [
  { name: "name", label: "Product Name", required: true, placeholder: "e.g. Aura Hoodie — Raspberry", colSpan: 2 },
  { name: "fandom", label: "Fandom", type: "select", required: true, options: ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"] },
  { name: "category", label: "Category", required: true, placeholder: "e.g. Apparel, Figures, Posters" },
  { name: "images", label: "Image URLs (comma-separated)", type: "tags", colSpan: 2, placeholder: "https://img1…, https://img2…" },
  { name: "tags", label: "Tags", type: "tags", colSpan: 2, placeholder: "limited, hoodie, unisex" },
  { name: "description", label: "Description", type: "textarea", rows: 4, colSpan: 2, placeholder: "Materials, sizing, fandom lore…" },
  { name: "externalUrl", label: "External URL", type: "url", colSpan: 2, placeholder: "https://store link…" },
  { name: "isUpcoming", label: "Upcoming Drop", type: "boolean", colSpan: 2 },
];

export default function ManageMerch() {
  return (
    <CrudManager
      resource="merch"
      title="MERCH"
      subtitle="Showcase-only merchandise catalog (no checkout — links out only)."
      columns={columns}
      fields={fields}
      transformSubmit={(p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      })}
      emptyMessage="No merch yet — add your first collectible!"
    />
  );
}
