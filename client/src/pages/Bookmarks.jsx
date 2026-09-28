import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark,
  FiFileText,
  FiGrid,
  FiImage,
  FiSearch,
  FiTrash2,
  FiUser,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';
import mariaApi from '../services/mariaApi';

const TYPE_CONFIG = {
  article: { label: 'Article', icon: FiFileText, path: '/articles' },
  character: { label: 'Character', icon: FiUser, path: '/characters' },
  content: { label: 'Content', icon: FiGrid, path: '/content' },
  media: { label: 'Media', icon: FiImage, path: '/media' },
  merch: { label: 'Merch', icon: FiBookmark, path: '/merch' },
  merchandise: { label: 'Merch', icon: FiBookmark, path: '/merch' },
  video: { label: 'Video', icon: FiImage, path: '/content' },
};

const getItem = (bookmark) => bookmark.item || bookmark.itemData || {};

const getTitle = (bookmark) => {
  const item = getItem(bookmark);
  return item.title || item.name || 'Saved item';
};

const getImage = (bookmark) => {
  const item = getItem(bookmark);
  return item.imageUrl || item.posterUrl || item.coverImage || item.thumbnail || '';
};

const getCategory = (bookmark) => {
  const item = getItem(bookmark);
  return CATEGORIES.find((category) => category.slug === item.categorySlug) || null;
};

const getHref = (bookmark) => {
  const type = bookmark.itemType;
  const item = getItem(bookmark);
  const id = item._id || bookmark.itemId;
  const path = TYPE_CONFIG[type]?.path || '/content';
  return `${path}/${id}`;
};

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadBookmarks = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await mariaApi.get('/bookmarks');
        const list = data.items || data.bookmarks || [];
        if (mounted) setBookmarks(list);
      } catch (err) {
        console.error('Load bookmarks error:', err);
        if (mounted) setError('Could not load bookmarks. Please sign in and try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadBookmarks();
    return () => {
      mounted = false;
    };
  }, []);

  const availableTypes = useMemo(() => {
    const types = [...new Set(bookmarks.map((bookmark) => bookmark.itemType).filter(Boolean))];
    return ['all', ...types];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookmarks.filter((bookmark) => {
      const matchesType = activeType === 'all' || bookmark.itemType === activeType;
      const item = getItem(bookmark);
      const matchesQuery =
        !needle ||
        getTitle(bookmark).toLowerCase().includes(needle) ||
        String(item.description || item.excerpt || item.series || '').toLowerCase().includes(needle);
      return matchesType && matchesQuery;
    });
  }, [activeType, bookmarks, query]);

  const removeBookmark = async (bookmark) => {
    try {
      await mariaApi.delete(`/bookmarks/${bookmark._id || bookmark.itemId}`, {
        data: { itemType: bookmark.itemType },
      });
      setBookmarks((current) =>
        current.filter((item) => String(item._id || item.itemId) !== String(bookmark._id || bookmark.itemId)),
      );
    } catch (err) {
      console.error('Remove bookmark error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <section className="relative overflow-hidden px-4 pb-10 pt-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[var(--primary)] opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-[var(--raspberry)] opacity-15 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/50 bg-[var(--surface)]/60 px-3 py-1 backdrop-blur-sm">
            <FiBookmark className="text-[var(--yellow)]" size={12} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--yellow)]">
              Saved Fandom
            </span>
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-orbitron text-4xl font-black leading-tight text-[var(--cream)] md:text-5xl">
                My Bookmarks
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
                Articles, characters, content, media and merch saved through the shared Fan Hub Plus bookmark API.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bookmarks..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--nav)] py-3 pl-11 pr-4 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeType === type
                  ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]'
                  : 'border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)]'
              }`}
            >
              {type === 'all' ? 'All' : TYPE_CONFIG[type]?.label || type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center text-sm text-[var(--muted)]">
            Loading bookmarks...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center text-sm text-[var(--muted)]">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center">
            <FiBookmark size={34} className="mx-auto mb-4 text-[var(--primary)]" />
            <h2 className="font-orbitron text-2xl font-bold text-[var(--cream)]">No bookmarks found</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
              Save articles, characters, content, media or merch and they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((bookmark) => {
              const item = getItem(bookmark);
              const category = getCategory(bookmark);
              const config = TYPE_CONFIG[bookmark.itemType] || TYPE_CONFIG.content;
              const TypeIcon = config.icon;
              const image = getImage(bookmark);

              return (
                <article
                  key={bookmark._id || `${bookmark.itemType}-${bookmark.itemId}`}
                  className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/45 backdrop-blur-md transition hover:border-[var(--primary)]/60 hover:shadow-[0_0_25px_var(--glow)]"
                >
                  <Link to={getHref(bookmark)} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--nav)]">
                      {image ? (
                        <img
                          src={image}
                          alt={getTitle(bookmark)}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--muted)]">
                          <TypeIcon size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent" />
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                        style={{
                          backgroundColor: `${category?.color || '#FF006B'}30`,
                          border: `1px solid ${category?.color || '#FF006B'}60`,
                          color: category?.color || 'var(--primary)',
                        }}
                      >
                        <TypeIcon size={11} />
                        {config.label}
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="font-orbitron text-base font-bold leading-snug text-[var(--cream)] transition group-hover:text-[var(--primary)]">
                        {getTitle(bookmark)}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                        {item.description || item.excerpt || item.series || bookmark.note || 'Saved to your Fan Hub Plus library.'}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      {bookmark.createdAt ? new Date(bookmark.createdAt).toLocaleDateString() : 'Saved'}
                    </span>
                    <button
                      onClick={() => removeBookmark(bookmark)}
                      aria-label="Remove bookmark"
                      className="rounded-full p-2 text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Bookmarks;
