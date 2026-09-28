import CrudManager from "@/components/admin/CrudManager";

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const ARTICLE_CATEGORIES = ["Reviews", "Theories", "News", "Interviews", "Guides", "Opinion", "Fan Fiction", "Editorials"];

const columns = [
  {
    key: "title",
    label: "Title",
    render: (a) => (
      <div>
        <p className="font-medium">{a.title}</p>
        <p className="text-xs text-[var(--muted)]">by {a.author || "Unknown"}</p>
      </div>
    ),
  },
  { key: "fandom", label: "Fandom" },
  {
    key: "status",
    label: "Status",
    render: (a) => {
      const styles = {
        published: "bg-[var(--yellow)] text-[var(--bg)]",
        draft: "bg-[var(--surface-light)] text-[var(--cream)]",
        archived: "border border-[var(--border)] text-[var(--muted)]",
      };
      return (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            styles[a.status] || styles.draft
          }`}
        >
          {a.status || "draft"}
        </span>
      );
    },
  },
  { key: "views", label: "Views", render: (a) => a.views ?? 0 },
  {
    key: "publishedAt",
    label: "Published",
    render: (a) => (a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "—"),
  },
];

const fields = [
  { name: "title", label: "Title", required: true, placeholder: "Article headline", colSpan: 2 },
  { name: "author", label: "Author", required: true, placeholder: "Writer name" },
  { name: "fandom", label: "Fandom", type: "select", required: true, options: ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"] },
  { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, colSpan: 2, placeholder: "One-line teaser shown on cards…" },
  { name: "content", label: "Content (HTML allowed)", type: "textarea", rows: 8, colSpan: 2, placeholder: "<p>Rich text, embeds and images…</p>" },
  { name: "coverImage", label: "Cover Image URL", type: "url", colSpan: 2, placeholder: "https://…" },
  { name: "tags", label: "Tags", type: "tags", colSpan: 2, placeholder: "lorem, fandom, theory" },
  { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"], default: "draft" },
  { name: "featured", label: "Featured", type: "select", options: ["false", "true"], default: "false" },
  { name: "category", label: "Category", type: "select", options: ["Theories", "Reviews", "News", "Opinions", "Guides", "Interviews", "Editorials", "Fan Fiction"], required: true },
];

export default function ManageArticles() {
  return (
    <CrudManager
      resource="admin/articles"
      title="ARTICLES"
      subtitle="Write, publish and archive fandom articles."
      columns={columns}
      fields={fields}
      filters={[
        { type: "chips", key: "fandom", options: FANDOMS, allLabel: "All Categories" },
        { type: "select", key: "status", label: "Status", options: ["draft", "published", "archived"] },
      ]}
      transformSubmit={(p) => ({
        ...p,
        featured: p.featured === "true" || p.featured === true,
        publishedAt: p.status === "published" ? p.publishedAt || new Date().toISOString() : null,
      })}
      emptyMessage="No articles yet — publish your first story!"
    />
  );
}
