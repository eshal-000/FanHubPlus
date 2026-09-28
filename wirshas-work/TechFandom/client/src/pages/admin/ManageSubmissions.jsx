import { Check, CheckCheck, ClipboardCheck, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const STATUSES = ["pending", "approved", "rejected", "published"];
const STATUS_TONE = {
  pending: "muted",
  approved: "surface",
  rejected: "primary",
  published: "yellow",
};

const columns = [
  {
    key: "userName",
    label: "User",
    render: (s) => (
      <div>
        <p className="font-medium">{s.userName || s.user?.name || "Anonymous"}</p>
        {s.user?.email && <p className="text-xs text-[var(--muted)]">{s.user.email}</p>}
      </div>
    ),
  },
  { key: "title", label: "Title", render: (s) => <span className="font-medium">{s.title}</span> },
  { key: "category", label: "Category" },
  { key: "fandom", label: "Fandom", render: (s) => <Pill value={s.fandom} /> },
  { key: "status", label: "Status", render: (s) => <Pill value={s.status} tone={STATUS_TONE[s.status] || "muted"} /> },
  { key: "createdAt", label: "Submitted", render: (s) => fmtDate(s.createdAt || s.submittedAt) },
];

function SubmissionRowActions({ item, patch, busyId }) {
  const busy = busyId === item._id;
  const act = (status) => patch(item._id, { status });

  return (
    <div className="flex justify-end gap-1.5">
      {item.status !== "approved" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => act("approved")}
          className="h-8 bg-[var(--surface-light)] px-2 text-[var(--yellow)] hover:bg-surface-light/70"
          title="Approve"
        >
          {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--yellow)] border-t-transparent" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
      )}
      {item.status !== "rejected" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => act("rejected")}
          className="h-8 bg-[var(--surface-light)] px-2 text-[var(--primary)] hover:bg-primary/20"
          title="Reject"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      {item.status === "approved" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => act("published")}
          className="h-8 bg-[var(--yellow)] px-2 text-[var(--bg)] hover:bg-yellow/80"
          title="Publish"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function ManageSubmissions() {
  return (
    <CrudManager
      resource="admin/submissions"
      title="SUBMISSIONS"
      subtitle="Fan-submitted content — approve, reject, publish or bulk-moderate."
      columns={columns}
      filters={[
        { type: "select", key: "status", label: "Statuses", options: STATUSES },
      ]}
      fields={[
        { name: "status", label: "Status", type: "select", required: true, options: STATUSES },
        { name: "adminNote", label: "Admin Note", type: "textarea", rows: 3, colSpan: 2, placeholder: "Visible moderation note…" },
      ]}
      rowActions={SubmissionRowActions}
      selectable
      showAdd={false}
      bulkActions={[
        {
          label: "Approve All",
          value: "approve",
          icon: <CheckCheck className="mr-1.5 h-3.5 w-3.5" />,
          className: "bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]",
        },
        {
          label: "Mark as Reviewed",
          value: "reviewed",
          icon: <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />,
          className: "border border-[var(--border)] bg-[var(--surface-light)] text-[var(--cream)] hover:bg-surface-light/70",
        },
        {
          label: "Delete All",
          value: "delete",
          icon: <Trash2 className="mr-1.5 h-3.5 w-3.5" />,
          className: "bg-[var(--raspberry)] text-[var(--cream)] hover:bg-[var(--primary)]",
        },
      ]}
      emptyMessage="No submissions in the queue — the fans are quiet."
    />
  );
}
