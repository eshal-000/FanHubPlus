import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const state = {
  ids: new Set(),
  listeners: new Set(),
  loadedWithToken: null,
  loginPromptOpen: false,
};

let inflightToken = null;

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("fanhub_user") || "null");
  } catch {
    return null;
  }
}

function readToken() {
  const user = readUser();
  return (
    user?.token ||
    localStorage.getItem("fanhub_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function notify() {
  for (const fn of state.listeners) fn();
}

function setIds(next) {
  state.ids = next;
  notify();
}

export default function useBookmarks() {
  const [, bump] = useState(0);

  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    state.listeners.add(fn);
    return () => {
      state.listeners.delete(fn);
    };
  }, []);

  const user = readUser();
  const token = readToken();

  useEffect(() => {
    if (state.loadedWithToken === token) return;
    if (inflightToken === token) return;
    inflightToken = token;
    if (!token) {
      setIds(new Set());
      state.loadedWithToken = token;
      inflightToken = null;
      return;
    }
    axios
      .get(`${API}/bookmarks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (inflightToken !== token) return;
        const list = Array.isArray(data) ? data : data?.items || data?.bookmarks || [];
        setIds(
          new Set(
            list
              .map((b) => b?.item?._id || b?.itemId || b?._id)
              .filter(Boolean)
              .map(String)
          )
        );
        state.loadedWithToken = token;
      })
      .catch(() => {
        if (inflightToken !== token) return;
        setIds(new Set());
        state.loadedWithToken = token;
      })
      .finally(() => {
        if (inflightToken === token) inflightToken = null;
      });
  }, [token]);

  const toggle = useCallback(
    async (itemId, itemType = "character") => {
      if (!token) {
        state.loginPromptOpen = true;
        notify();
        return undefined;
      }
      const idStr = String(itemId);
      const wasBookmarked = state.ids.has(idStr);
      const next = new Set(state.ids);
      if (wasBookmarked) next.delete(idStr);
      else next.add(idStr);
      setIds(next);
      try {
        if (wasBookmarked) {
          await axios.delete(`${API}/bookmarks/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { itemType },
          });
        } else {
          await axios.post(
            `${API}/bookmarks`,
            { itemId, itemType },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        return !wasBookmarked;
      } catch (err) {
        const rollback = new Set(state.ids);
        if (wasBookmarked) rollback.add(idStr);
        else rollback.delete(idStr);
        setIds(rollback);
        throw err;
      }
    },
    [token]
  );

  const isBookmarked = useCallback((id) => state.ids.has(String(id)), []);

  const requireLogin = useCallback(() => !token, [token]);

  const closeLoginPrompt = useCallback(() => {
    state.loginPromptOpen = false;
    notify();
  }, []);

  return {
    user,
    isLoggedIn: Boolean(token),
    isBookmarked,
    toggle,
    requireLogin,
    loadingBookmarks: Boolean(token) && state.loadedWithToken !== token,
    showLoginPrompt: state.loginPromptOpen,
    closeLoginPrompt,
    bookmarkCount: state.ids.size,
  };
}
