import { useMemo, useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Eye,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import AdminShell from "@/components/admin/AdminShell";

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]/40"
          style={{ animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}

function DeleteDialog({ open, target, busy, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="border-[var(--border)] bg-[var(--surface)] text-[var(--cream)] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-['Orbitron'] text-base">
            <AlertTriangle className="h-5 w-5 text-[var(--yellow)]" />
            DELETE ITEM
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--muted)]">
          Delete{" "}
          <span className="font-semibold text-[var(--cream)]">
            {target?.name || target?.title || "this item"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-[var(--border)] bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            className="bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CrudManager({
  resource,
  title,
  subtitle,
  columns,
  fields,
  transformSubmit,
  emptyMessage = "Nothing here yet. Create your first item!",
  selectable = false,
  bulkActions = [],
  rowActions = null,
  viewRenderer = null,
  showAdd = true,
  showEdit = true,
  showDelete = true,
  filters = null,
}) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  const activeParams = useMemo(() => {
    const out = {};
    for (const [k, v] of Object.entries(filterValues)) {
      if (v !== "" && v !== "all" && v != null) out[k] = v;
    }
    return out;
  }, [filterValues]);
  const hasActiveFilters = Object.keys(activeParams).length > 0;
  const setFilter = (key, value) =>
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilterValues({});

  const crud = useAdminCrud(resource, { params: activeParams });

  const visible = useMemo(() => {
    let rows = crud.items;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(q)
      );
    }
    if (sort.key) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
        return String(av).localeCompare(String(bv)) * sort.dir;
      });
    }
    return rows;
  }, [crud.items, search, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));

  const allVisibleSelected =
    visible.length > 0 && visible.every((r) => selectedIds.includes(r._id));
  const toggleSelectAll = () =>
    setSelectedIds(allVisibleSelected ? [] : visible.map((r) => r._id));
  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const runBulk = async (action) => {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    setBulkMsg("");
    try {
      await crud.bulkAction(action, selectedIds);
      setBulkMsg(`✓ ${action} applied to ${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""}`);
      setSelectedIds([]);
    } catch (err) {
      setBulkMsg(err.response?.data?.message || "Bulk action failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const emptyVals = useMemo(
    () =>
      Object.fromEntries(
        (fields || []).map((f) => [
          f.name,
          f.default !== undefined ? f.default : f.type === "boolean" ? false : "",
        ])
      ),
    [fields]
  );
  const [values, setValues] = useState(emptyVals);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setValues(emptyVals);
    crud.openCreate();
  };

  const openEdit = (item) => {
    const seeded = { ...emptyVals };
    for (const f of fields || []) {
      const v = item[f.name];
      if (Array.isArray(v)) seeded[f.name] = v.join(", ");
      else if (f.type === "date" && v) seeded[f.name] = String(v).slice(0, 10);
      else if (v != null) seeded[f.name] = typeof v === "boolean" ? String(v) : v;
    }
    setValues(seeded);
    crud.openEdit(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      let payload = { ...values };
      for (const f of fields || []) {
        if (f.type === "tags" || f.type === "array") {
          payload[f.name] = String(payload[f.name] || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (f.type === "number") payload[f.name] = payload[f.name] === "" ? undefined : Number(payload[f.name]);
        if (f.type === "boolean") payload[f.name] = String(payload[f.name]) === "true";
      }
      if (transformSubmit) payload = transformSubmit(payload);
      await crud.save(payload);
      crud.closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || "Save failed. Check the fields and retry.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (f) => {
    const common =
      "w-full rounded-md border border-[var(--border)] bg-[rgba(24,0,18,0.6)] text-[var(--cream)] placeholder:text-[var(--muted)]/50 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]";
    switch (f.type) {
      case "textarea":
        return (
          <textarea
            id={`f-${f.name}`}
            rows={f.rows || 4}
            placeholder={f.placeholder}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className={`rounded-md border px-3 py-2 text-sm ${common}`}
          />
        );
      case "select":
        return (
          <select
            id={`f-${f.name}`}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className={`rounded-md border px-3 py-2 text-sm ${common}`}
          >
            <option value="">Select…</option>
            {(f.options || []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );
      case "boolean":
        return (
          <button
            type="button"
            role="switch"
            aria-checked={String(values[f.name]) === "true"}
            aria-label={f.label}
            onClick={() =>
              setValues((v) => ({ ...v, [f.name]: !(String(v[f.name]) === "true") }))
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition-all ${
              String(values[f.name]) === "true"
                ? "bg-[var(--primary)] shadow-[0_0_20px_var(--glow)]"
                : "border border-[var(--border)] bg-[var(--surface-light)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--cream)] transition-all ${
                String(values[f.name]) === "true" ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        );
      default:
        return (
          <Input
            id={`f-${f.name}`}
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
            step={f.step}
            placeholder={f.placeholder}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className={common}
          />
        );
    }
  };

  return (
    <AdminShell title={title} subtitle={subtitle}>
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-['Orbitron'] text-2xl font-bold tracking-wide">
              MANAGE <span className="text-[var(--primary)]">{title}</span>
            </h1>
            {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
          </div>
          {showAdd && (
            <Button
              onClick={openCreate}
              className="bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
            >
              <Plus className="mr-2 h-4 w-4" /> ADD NEW
            </Button>
          )}
        </div>

        {selectable && bulkActions.length > 0 && (
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex flex-col gap-3 rounded-xl border border-[var(--primary)]/40 bg-[var(--surface)]/60 p-3 shadow-[0_0_20px_var(--glow)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-[var(--cream)]">
                    {selectedIds.length} selected
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {bulkMsg && <span className="mr-1 text-xs text-[var(--yellow)]">{bulkMsg}</span>}
                    {bulkActions.map((b) => (
                      <Button
                        key={b.value}
                        size="sm"
                        disabled={bulkBusy}
                        onClick={() => runBulk(b.value)}
                        className={b.className || "bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]"}
                      >
                        {bulkBusy ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          b.icon
                        )}
                        {b.label}
                      </Button>
                      ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedIds([])}
                      className="border-[var(--border)] bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]"
                    >
                      Clear
                    </Button>
                  </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="border-[var(--border)] bg-[var(--surface)]/40 pl-9 text-[var(--cream)] placeholder:text-[var(--muted)]/50"
          />
        </div>

        {filters && filters.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {filters.map((f) => {
              if (f.type === "chips") {
                const current = filterValues[f.key] || "";
                const toChip = (val, lab) => (
                  <button
                    key={String(val) || "__all__"}
                    type="button"
                    onClick={() => setFilter(f.key, val)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      current === val
                        ? "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_14px_var(--glow)]"
                        : "border border-[var(--border)] bg-surface-light/40 text-[var(--muted)] hover:text-[var(--cream)]"
                    }`}
                  >
                    {lab}
                  </button>
                );
                return (
                  <div key={f.key} className="flex flex-wrap items-center gap-1.5">
                    {toChip("", f.allLabel || "All")}
                    {f.options.map((o) =>
                      toChip(typeof o === "string" ? o : o.value, typeof o === "string" ? o : o.label)
                    )}
                  </div>
                );
              }
              const opts = (f.options || []).map((o) =>
                typeof o === "string" ? { value: o, label: o } : o
              );
              const current = filterValues[f.key] || "";
              return (
                <select
                  key={f.key}
                  aria-label={f.label || f.key}
                  value={current}
                  onChange={(e) => setFilter(f.key, e.target.value)}
                  className={`rounded-lg border px-3.5 py-2 pr-9 text-sm font-medium transition-all ${
                    current
                      ? "border-[var(--primary)]/60 bg-[var(--primary)]/15 text-[var(--cream)] shadow-[0_0_12px_var(--glow)]"
                      : "border-[var(--border)] bg-[var(--nav)]/60 text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--cream)]"
                  }`}
                >
                  <option value="">{f.allLabel || `All ${f.label || f.key}`}</option>
                  {opts.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              );
            })}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[var(--primary)] underline underline-offset-2 hover:text-[var(--yellow)]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {crud.error && (
          <div className="mb-4 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-3 text-sm">
            {crud.error}{" "}
            <button onClick={crud.reload} className="font-semibold text-[var(--primary)] underline">
              Retry
            </button>
          </div>
        )}

        {crud.loading ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 py-16 text-center backdrop-blur-md">
            <Inbox className="h-8 w-8 text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)] hover:bg-transparent">
                    {selectable && (
                      <TableHead className="w-10">
                        <button
                          type="button"
                          aria-label={allVisibleSelected ? "Deselect all" : "Select all"}
                          onClick={toggleSelectAll}
                          className="text-[var(--cream)] hover:text-[var(--yellow)]"
                        >
                          {allVisibleSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                        </button>
                      </TableHead>
                    )}
                    {columns.map((c) => (
                      <TableHead key={c.key} className="text-[var(--muted)]">
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className="flex items-center gap-1 hover:text-[var(--yellow)]"
                        >
                          {c.label}
                          {sort.key === c.key &&
                            (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                        </button>
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-[var(--muted)]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {visible.map((item) => (
                      <motion.tr
                        key={item._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-[var(--border)] hover:bg-[var(--surface-light)]/30 ${
                          selectedIds.includes(item._id) ? "bg-[var(--primary)]/10" : ""
                        }`}
                      >
                        {selectable && (
                          <TableCell>
                            <button
                              type="button"
                              aria-label={selectedIds.includes(item._id) ? "Deselect row" : "Select row"}
                              onClick={() => toggleSelect(item._id)}
                              className="text-[var(--cream)] hover:text-[var(--yellow)]"
                            >
                              {selectedIds.includes(item._id) ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
                        )}
                        {columns.map((c) => (
                          <TableCell key={c.key} className="text-sm text-[var(--cream)]">
                            {c.render ? c.render(item) : item[c.key] ?? "—"}
                          </TableCell>
                        ))}
                        {rowActions && (
                          <TableCell className="text-right">{rowActions({ item, patch: crud.patch, busyId: crud.busyId })}</TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {viewRenderer && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewItem(item)}
                                className="h-8 border-[var(--border)] bg-transparent px-2 text-[var(--yellow)] hover:bg-[var(--surface-light)]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {showEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(item)}
                              className="h-8 border-[var(--border)] bg-transparent px-2 text-[var(--cream)] hover:bg-[var(--surface-light)]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            )}
                            {showDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteTarget(item)}
                              className="h-8 border-[var(--border)] bg-transparent px-2 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
              {visible.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 backdrop-blur-md"
                >
                  {selectable && (
                    <button
                      type="button"
                      aria-label={selectedIds.includes(item._id) ? "Deselect item" : "Select item"}
                      onClick={() => toggleSelect(item._id)}
                      className="mb-2 text-[var(--cream)] hover:text-[var(--yellow)]"
                    >
                      {selectedIds.includes(item._id) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {columns.slice(0, 4).map((c) => (
                    <div key={c.key} className="flex justify-between gap-3 py-0.5 text-sm">
                      <span className="text-[var(--muted)]">{c.label}</span>
                      <span className="text-right font-medium text-[var(--cream)]">
                        {c.render ? c.render(item) : item[c.key] ?? "—"}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-3">
                    {rowActions && rowActions({ item, patch: crud.patch, busyId: crud.busyId })}
                    {viewRenderer && (
                      <Button size="sm" variant="outline" onClick={() => setViewItem(item)} className="h-8 border-[var(--border)] bg-transparent text-[var(--yellow)] hover:bg-[var(--surface-light)]">
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                    )}
                    {showEdit && (
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="h-8 border-[var(--border)] bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]">
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                    )}
                    {showDelete && (
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(item)} className="h-8 border-[var(--border)] bg-transparent text-[var(--primary)] hover:bg-[var(--primary)]/20">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!crud.loading && visible.length > 0 && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Showing {visible.length} of {crud.items.length} {title.toLowerCase()}
          </p>
        )}
      </div>

      <Dialog open={crud.formOpen} onOpenChange={(o) => !o && crud.closeForm()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--border)] bg-[var(--surface)] text-[var(--cream)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-['Orbitron'] text-lg tracking-wider">
              {crud.editing ? "EDIT" : "NEW"} {title} <span className="text-[var(--primary)]">·</span>
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3 py-2 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(fields || []).map((f) => (
              <div key={f.name} className={f.colSpan === 2 ? "sm:col-span-2" : ""}>
                <label htmlFor={`f-${f.name}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {f.label}
                  {f.required && <span className="text-[var(--primary)]"> *</span>}
                </label>
                {renderField(f)}
              </div>
            ))}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={crud.closeForm}
                className="border-[var(--border)] bg-transparent text-[var(--cream)] hover:bg-[var(--surface-light)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING…
                  </>
                ) : crud.editing ? (
                  "Save Changes"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteTarget}
        target={deleteTarget}
        busy={deleteTarget ? crud.busyId === deleteTarget._id : false}
        onConfirm={async () => {
          await crud.remove(deleteTarget._id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-[var(--border)] bg-[var(--surface)] text-[var(--cream)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Orbitron'] text-base tracking-wider">DETAILS</DialogTitle>
          </DialogHeader>
          {viewItem && viewRenderer && viewRenderer({ item: viewItem, close: () => setViewItem(null) })}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

export function Pill({ value, tone = "surface" }) {
  if (!value) return <span className="text-[var(--muted)]">—</span>;
  const tones = {
    surface: "border border-[var(--border)] bg-[var(--surface-light)]/60 text-[var(--cream)]",
    yellow: "bg-[var(--yellow)] text-[var(--bg)] font-semibold",
    primary: "bg-[var(--primary)]/20 text-[var(--cream)]",
    muted: "border border-[var(--border)] text-[var(--muted)]",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${tones[tone] || tones.surface}`}>
      {value}
    </span>
  );
}

export function TagList({ value }) {
  const arr = Array.isArray(value) ? value : value ? String(value).split(",") : [];
  if (!arr.length) return <span className="text-[var(--muted)]">—</span>;
  return (
    <div className="flex max-w-[200px] flex-wrap gap-1">
      {arr.map((t, i) => (
        <span
          key={i}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-light)]/60 px-2 py-0.5 text-[11px] text-[var(--cream)]"
        >
          {String(t).trim()}
        </span>
      ))}
    </div>
  );
}

export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString() : "—";
}
