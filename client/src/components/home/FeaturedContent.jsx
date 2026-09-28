import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import mariaApi from '../../services/mariaApi'
import { applyContentAssetOverrides } from '../../utils/fandomAssets'
import { imageFor } from '../../utils/contentDisplay'

export default function FeaturedContent() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const response = await mariaApi.get('/contents', { params: { limit: 4 } })
        if (!cancelled) setItems((response.data.contents || []).map(applyContentAssetOverrides))
      } catch (err) {
        if (!cancelled) {
          const status = err?.response?.status
          const msg =
            err?.response?.data?.message ||
            err.message ||
            'Failed to load content'
          setError(status ? `HTTP ${status}: ${msg}` : msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-bg-alt py-20">
      <div className="fp-container">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="special text-sm uppercase tracking-[0.28em] text-yellow">Trending</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-black text-cream">
              Featured Content
            </h2>
          </div>
          <Link
            className="group inline-flex items-center gap-1 text-sm font-semibold text-yellow transition hover:text-primary"
            to="/explore"
          >
            Explore all
            <ArrowUpRight
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={14}
            />
          </Link>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-card" key={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="text-sm text-muted">
              Featured content could not be loaded.
            </p>
            <p className="mt-1 text-xs text-muted/70">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="text-sm text-muted">No featured content yet.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Link
                  className="group block overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-[0_4px_24px_rgba(153,0,77,0.22)] transition-all duration-400 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_0_28px_rgba(255,0,107,0.38),0_14px_40px_rgba(153,0,77,0.30)]"
                  to={`/content/${item.slug || item._id}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-bg">
                    {imageFor(item) ? (
                      <img
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                        loading="lazy"
                        src={imageFor(item)}
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow">
                      {item.categoryInfo?.name || item.category || item.categorySlug}
                    </span>
                    <h3 className="mt-2 line-clamp-2 font-orbitron text-sm font-bold text-cream">
                      {item.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                      View <ArrowUpRight size={12} />
                    </span>
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
