import { CheckCircle2, CircleDashed, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrudManager, { Pill, fmtDate } from "@/components/admin/CrudManager";

const TYPES = ["bug", "suggestion", "query"];
const STATUSES = ["open", "in-progress", "resolved"];
const TYPE_TONE = { bug: "primary", suggestion: "yellow", query: "surface" };
const STATUS_TONE = { open: "muted", "in-progress": "surface", resolved: "yellow" };

const columns = [
  {
    key: "user",
    label: "From",
    render: (f) => (
      <div>
        <p className="font-medium">{f.user?.name || f.name || "Guest"}</p>
        <p className="text-xs text-[var(--muted)]">{f.user?.email || f.email || "no email"}</p>
      </div>
    ),
  },
  { key: "type", label: "Type", render: (f) => <Pill value={f.type} tone={TYPE_TONE[f.type] || "muted"} /> },
  { key: "subject", label: "Subject", render: (f) => <span className="font-medium">{f.subject}</span> },
  { key: "status", label: "Status", render: (f) => <Pill value={f.status} tone={STATUS_TONE[f.status] || "muted"} /> },
  { key: "createdAt", label: "Created", render: (f) => fmtDate(f.createdAt) },
];

function FeedbackRowActions({ item, patch, busyId }) {
  const busy = busyId === item._id;
  const act = (status) => patch(item._id, { status });
  const spinner = (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--yellow)] border-t-transparent" />
  );

  return (
    <div className="flex justify-end gap-1.5">
      {item.status === "open" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => act("in-progress")}
          className="h-8 bg-[var(--surface-light)] px-2 text-[var(--yellow)] hover:bg-[var(--surface-light)]/70"
          title="Start working"
        >
          {busy ? spinner : <CircleDashed className="h-3.5 w-3.5" />}
        </Button>
      )}
      {item.status !== "resolved" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => act("resolved")}
          className="h-8 bg-[var(--surface-light)] px-2 text-[var(--yellow)] hover:bg-[var(--surface-light)]/70"
          title="Mark resolved"
        >
          {busy ? spinner : <CheckCircle2 className="h-3.5 w-3.5" />}
        </Button>
      )}
      {item.status === "resolved" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => act("open")}
          className="h-8 bg-[var(--surface-light)] px-2 text-[var(--muted)] hover:bg-[var(--surface-light)]/70"
          title="Reopen"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function ManageFeedback() {
  return (
    <CrudManager
      resource="feedback"
      title="FEEDBACK"
      subtitle="Bugs, suggestions and queries from the community."
      columns={columns}
      fields={[
        { name: "status", label: "Status", type: "select", required: true, options: STATUSES },
        { name: "adminNote", label: "Admin Note", type: "textarea", rows: 3, colSpan: 2, placeholder: "Internal note…" },
      ]}
      rowActions={FeedbackRowActions}
      selectable
      showAdd={false}
      bulkActions={[
        {
          label: "Mark as Resolved",
          value: "resolve",
          icon: <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />,
          className: "bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]",
        },
        {
          label: "Delete All",
          value: "delete",
          icon: <Trash2 className="mr-1.5 h-3.5 w-3.5" />,
          className: "bg-[var(--raspberry)] text-[var(--cream)] hover:bg-[var(--primary)]",
        },
      ]}
      emptyMessage="Inbox zero — no feedback right now."
    />
  );
}
