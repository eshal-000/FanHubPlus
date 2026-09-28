import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const API = `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const state = {
  ids: new Set(),
  listeners: new Set(),
  loadedWithToken: null,
  loginPromptOpen: false,
};

let inflightToken = null;

function notify() {
  for (const fn of state.listeners) fn();
}

function setIds(next) {
  state.ids = next;
  notify();
}

export default function useBookmarks() {
  const [, bump] = useState(0);
  const { clearSession, isAuthenticated, token, user } = useAuth();

  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    state.listeners.add(fn);
    return () => {
      state.listeners.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      if (!token) {
        setIds(new Set());
        state.loadedWithToken = null;
        inflightToken = null;
      }
      return;
    }

    if (state.loadedWithToken === token) return;
    if (inflightToken === token) return;
    inflightToken = token;

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
      .catch((err) => {
        if (inflightToken !== token) return;
        setIds(new Set());
        state.loadedWithToken = token;
        if ([401, 403].includes(err?.response?.status)) clearSession();
      })
      .finally(() => {
        if (inflightToken === token) inflightToken = null;
      });
  }, [clearSession, isAuthenticated, token]);

  const toggle = useCallback(
    async (itemId, itemType = "merch") => {
      if (!token || !isAuthenticated) {
        state.loginPromptOpen = true;
        notify();
        return undefined;
      }

      const idStr = String(itemId);
      if (!idStr || idStr === "undefined" || idStr === "null") return undefined;

      const wasBookmarked = state.ids.has(idStr);
      const previous = new Set(state.ids);
      const next = new Set(previous);
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
        setIds(previous);
        if ([401, 403].includes(err?.response?.status)) {
          clearSession();
          state.loginPromptOpen = true;
          notify();
          return undefined;
        }
        throw err;
      }
    },
    [clearSession, isAuthenticated, token]
  );

  const isBookmarked = useCallback((id) => state.ids.has(String(id)), []);

  const requireLogin = useCallback(() => {
    if (token && isAuthenticated) return false;
    state.loginPromptOpen = true;
    notify();
    return true;
  }, [isAuthenticated, token]);

  const closeLoginPrompt = useCallback(() => {
    state.loginPromptOpen = false;
    notify();
  }, []);

  return {
    user,
    isLoggedIn: Boolean(token && isAuthenticated),
    isBookmarked,
    toggle,
    requireLogin,
    loadingBookmarks: Boolean(token && isAuthenticated) && state.loadedWithToken !== token,
    showLoginPrompt: state.loginPromptOpen,
    closeLoginPrompt,
    bookmarkCount: state.ids.size,
  };
}
