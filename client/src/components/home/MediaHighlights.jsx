import { ArrowUpRight, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMedia } from '../../services/mediaApi'

export default function MediaHighlights() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const response = await fetchMedia({ limit: 3 })

        if (!cancelled) setItems(response.data.data || [])
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err.message ||
            'Failed to load media'
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-bg py-20">
      <div className="fp-container">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="special text-sm uppercase tracking-[0.28em] text-yellow">Watch &amp; Listen</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-black text-cream">
              Media Highlights
            </h2>
          </div>
          <Link
            className="group inline-flex items-center gap-1 text-sm font-semibold text-yellow transition hover:text-primary"
            to="/media"
          >
            All media
            <ArrowUpRight
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={14}
            />
          </Link>
        </div>

        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div className="aspect-[16/10] animate-pulse rounded-2xl bg-card" key={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">
            Unable to load media: {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">
            No media yet. Check back soon.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Link
                  className="group relative block overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-[0_4px_24px_rgba(153,0,77,0.22)] transition-all duration-400 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_0_28px_rgba(255,0,107,0.38),0_14px_40px_rgba(153,0,77,0.30)]"
                  to={`/media/${item._id}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-bg">
                    {item.thumbnailUrl ? (
                      <img
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                        loading="lazy"
                        src={item.thumbnailUrl}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#180012] via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">
                      {item.mediaType}
                    </div>
                    <div className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-primary/90 text-cream shadow-lg shadow-primary/40 transition-transform duration-300 group-hover:scale-110">
                      <Play fill="currentColor" size={16} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-orbitron text-sm font-bold text-cream">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {item.fandom} · {item.category}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
