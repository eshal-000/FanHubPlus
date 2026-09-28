import { Bookmark, ShieldCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const ROLES = ["user", "admin"];

const columns = [
  {
    key: "name",
    label: "Name",
    render: (u) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-light)] font-['Orbitron'] text-xs text-[var(--yellow)]">
          {(u.name || u.username || "?")[0]?.toUpperCase()}
        </span>
        <div>
          <p className="font-medium">{u.name || u.username || "Unnamed"}</p>
          <p className="text-xs text-[var(--muted)]">{u.email}</p>
        </div>
      </div>
    ),
  },
  { key: "email", label: "Email", render: (u) => <span className="text-[var(--muted)]">{u.email}</span> },
  {
    key: "role",
    label: "Role",
    render: (u) =>
      u.role === "admin" ? (
        <Pill value="admin" tone="yellow" />
      ) : (
        <Pill value="user" tone="surface" />
      ),
  },
  {
    key: "favoriteFandoms",
    label: "Fandoms",
    render: (u) => {
      const n = Array.isArray(u.favoriteFandoms) ? u.favoriteFandoms.length : u.favoriteFandoms ?? 0;
      return (
        <span className="inline-flex items-center gap-1 text-sm">
          <Bookmark className="h-3.5 w-3.5 text-[var(--primary)]" /> {n}
        </span>
      );
    },
  },
  { key: "lastActive", label: "Last Active", render: (u) => fmtDate(u.lastActive) },
  { key: "createdAt", label: "Joined", render: (u) => fmtDate(u.createdAt) },
];

function UserRowActions({ item, patch, busyId }) {
  const busy = busyId === item._id;
  const nextRole = item.role === "admin" ? "user" : "admin";

  return (
    <Button
      size="sm"
      disabled={busy}
      onClick={() => patch(item._id, { role: nextRole })}
      className="h-8 whitespace-nowrap bg-[var(--surface-light)] px-2 text-xs text-[var(--cream)] hover:bg-[var(--surface-light)]/70"
      title={`Make ${nextRole}`}
    >
      {busy ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--yellow)] border-t-transparent" />
      ) : item.role === "admin" ? (
        <UserCog className="mr-1 h-3.5 w-3.5" />
      ) : (
        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
      )}
      {item.role === "admin" ? "Demote" : "Promote"}
    </Button>
  );
}

function ActivityView({ item }) {
  const sections = [
    { label: "Recent Bookmarks", items: item.recentBookmarks || item.bookmarks || [] },
    { label: "Recent Submissions", items: item.recentSubmissions || item.submissions || [] },
    { label: "Recent Feedback", items: item.recentFeedback || item.feedback || [] },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--nav)]/60 p-3">
        <p className="font-['Orbitron'] text-sm text-[var(--cream)]">{item.name || item.username}</p>
        <p className="text-xs text-[var(--muted)]">{item.email}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Role: <span className="text-[var(--yellow)]">{item.role}</span> · Joined{" "}
          {fmtDate(item.createdAt)} · Last active {fmtDate(item.lastActive)}
        </p>
        {Array.isArray(item.favoriteFandoms) && item.favoriteFandoms.length > 0 && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Fandoms: <span className="text-[var(--cream)]">{item.favoriteFandoms.join(", ")}</span>
          </p>
        )}
      </div>

      {sections.map((sec) => (
        <div key={sec.label}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {sec.label}
          </p>
          {sec.items.length === 0 ? (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 px-3 py-2 text-xs text-[var(--muted)]">
              Nothing yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {sec.items.slice(0, 5).map((b, i) => (
                <li
                  key={b._id || i}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 px-3 py-2 text-xs"
                >
                  <span className="truncate text-[var(--cream)]">
                    {b.title || b.subject || b.name || b.itemType || "Item"}
                  </span>
                  {(b.itemType || b.status || b.type) && (
                    <span className="shrink-0 rounded-full bg-[var(--surface-light)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                      {b.itemType || b.status || b.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ManageUsers() {
  return (
    <CrudManager
      resource="admin/users"
      title="USERS"
      subtitle="Community members — promote to admin and inspect activity. All other fields are read-only."
      columns={columns}
      fields={[
        { name: "role", label: "Role", type: "select", required: true, options: ROLES },
        { name: "adminNote", label: "Admin Note (internal)", type: "textarea", rows: 2, colSpan: 2 },
      ]}
      rowActions={UserRowActions}
      viewRenderer={ActivityView}
      showAdd={false}
      showDelete={false}
      emptyMessage="No users found."
    />
  );
}
