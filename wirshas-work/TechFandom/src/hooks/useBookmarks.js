import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

export default function useBookmarks() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fanhub_user") || "null");
    } catch {
      return null;
    }
  });
  const [bookmarkIds, setBookmarkIds] = useState(() => new Set());
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const token = user?.token || localStorage.getItem("token") || "";

  useEffect(() => {
    const onStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("fanhub_user") || "null"));
      } catch {
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const authHeaders = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) {
        setBookmarkIds(new Set());
        setLoadingBookmarks(false);
        return;
      }
      try {
        const { data } = await axios.get(`${API}/bookmarks`, { headers: authHeaders() });
        const list = Array.isArray(data) ? data : data?.items || data?.bookmarks || [];
        const ids = new Set(
          list
            .map((b) => b?.item?._id || b?.itemId || b?._id)
            .filter(Boolean)
            .map(String)
        );
        if (!cancelled) setBookmarkIds(ids);
      } catch {
        if (!cancelled) setBookmarkIds(new Set());
      } finally {
        if (!cancelled) setLoadingBookmarks(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, authHeaders]);

  const isLoggedIn = Boolean(token);

  const requireLogin = useCallback(() => !isLoggedIn, [isLoggedIn]);

  const toggle = useCallback(
    async (itemId, itemType = "character") => {
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return undefined; // caller decides whether to show a prompt too
      }
      const idStr = String(itemId);
      const wasBookmarked = bookmarkIds.has(idStr);
      setBookmarkIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.delete(idStr);
        else next.add(idStr);
        return next;
      });
      try {
        if (wasBookmarked) {
          await axios.delete(`${API}/bookmarks/${itemId}`, {
            headers: authHeaders(),
            data: { itemType },
          });
        } else {
          await axios.post(`${API}/bookmarks`, { itemId, itemType }, { headers: authHeaders() });
        }
        return !wasBookmarked;
      } catch (err) {
        setBookmarkIds((prev) => {
          const next = new Set(prev);
          if (wasBookmarked) next.add(idStr);
          else next.delete(idStr);
          return next;
        });
        throw err;
      }
    },
    [bookmarkIds, isLoggedIn, authHeaders]
  );

  const isBookmarked = useCallback((id) => bookmarkIds.has(String(id)), [bookmarkIds]);

  const closeLoginPrompt = useCallback(() => setShowLoginPrompt(false), []);

  return {
    user,
    isLoggedIn,
    isBookmarked,
    toggle,
    requireLogin,
    loadingBookmarks,
    showLoginPrompt,
    closeLoginPrompt,
  };
}
