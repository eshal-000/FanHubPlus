import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export function useAdminCrud(resource, { idKey = "_id", enabled = true, params = {} } = {}) {
  const base = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/${resource}`;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // item being edited, or null = create

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(base, {
        headers: authHeaders(),
        params: JSON.parse(paramsKey || "{}"),
      });
      setItems(Array.isArray(data) ? data : data?.data || data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [base, authHeaders, paramsKey]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback(
    (item) => {
      setEditing(item);
      setFormOpen(true);
      return item; // returned so pages can seed their form state
    },
    []
  );

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const save = useCallback(
    async (values) => {
      const payload = { ...values };
      if (editing) {
        await axios.put(`${base}/${editing[idKey]}`, payload, { headers: authHeaders() });
      } else {
        await axios.post(base, payload, { headers: authHeaders() });
      }
      await load();
    },
    [base, editing, idKey, load, authHeaders]
  );

  const remove = useCallback(
    async (id) => {
      setBusyId(id);
      try {
        await axios.delete(`${base}/${id}`, { headers: authHeaders() });
        setItems((prev) => prev.filter((it) => it[idKey] !== id));
      } finally {
        setBusyId(null);
      }
    },
    [base, idKey, authHeaders]
  );

  const patch = useCallback(
    async (id, partial) => {
      setBusyId(id);
      try {
        const { data } = await axios.patch(`${base}/${id}`, partial, { headers: authHeaders() });
        setItems((prev) =>
          prev.map((it) => (it[idKey] === id ? { ...it, ...(data || {}), _id: it._id } : it))
        );
      } finally {
        setBusyId(null);
      }
    },
    [base, idKey, authHeaders]
  );

  const bulkAction = useCallback(
    async (action, ids) => {
      await axios.post(
        `${base}/bulk`,
        { action, ids },
        { headers: authHeaders() }
      );
      await load();
    },
    [base, load, authHeaders]
  );

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return {
    items, loading, error, reload: load, busyId,
    formOpen, editing, openCreate, openEdit, closeForm, save, remove, patch, bulkAction,
    authHeaders, base,
  };
}
