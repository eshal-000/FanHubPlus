import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVerifiedImageUrl } from '../../utils/mediaAssets'

export default function RelatedSidebar({ currentId, category }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const { fetchMedia } = await import('../../services/mediaApi')
        const response = await fetchMedia({ category, limit: 8 })
        const list = (response.data.data || []).filter((m) => m._id !== currentId)
        if (!cancelled) setItems(list.slice(0, 4))
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [category, currentId])

  return (
    <div className="rounded-2xl border border-primary/25 bg-card p-4">
      <h3 className="font-orbitron text-sm font-bold uppercase tracking-widest text-yellow">
        You Might Also Like
      </h3>

      {loading && (
        <div className="mt-4 grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div className="h-24 animate-pulse rounded-lg bg-bg" key={i} />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-bg/50 p-4 text-center">
          <p className="text-xs text-muted">
            No related media in this category yet.
          </p>
          <Link
            className="mt-3 inline-block text-xs font-semibold text-yellow hover:text-primary"
            to="/media"
          >
            Browse all media →
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-4 grid gap-3">
          {items.map((item) => {
            const image = getVerifiedImageUrl(item.posterUrl, item.thumbnailUrl)

            return (
            <Link
              className="group flex gap-3 rounded-lg border border-border bg-bg-alt p-2 transition hover:border-primary/60 hover:shadow-[0_0_18px_rgba(255,0,107,0.25)]"
              key={item._id}
              to={`/media/${item._id}`}
            >
              <div className="aspect-[2/3] h-20 w-14 shrink-0 overflow-hidden rounded-md bg-bg">
                {image ? (
                  <img
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    src={image}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#390B2B] to-[#99004D]">
                    <span className="font-orbitron text-[0.6rem] font-bold text-cream/60">
                      {item.title?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="line-clamp-2 font-orbitron text-[0.72rem] font-bold text-cream">
                  {item.title}
                </p>
                <p className="mt-1 text-[0.65rem] text-muted">
                  {item.category} · {item.releaseYear || '—'}
                </p>
                {item.averageRating > 0 && (
                  <p className="mt-1 text-[0.62rem] text-yellow">
                    ★ {item.averageRating.toFixed(1)}
                  </p>
                )}
              </div>
            </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
