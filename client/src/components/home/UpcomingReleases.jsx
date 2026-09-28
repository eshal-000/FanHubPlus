import { CalendarClock, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../services/authApi'

function formatDate(value) {
  if (!value) return 'Date TBA'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export default function UpcomingReleases() {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadReleases() {
      try {
        setLoading(true)
        const { data } = await authApi.get('/releases', {
          params: { limit: 3, status: 'upcoming', sort: 'releaseDate' },
        })
        if (!cancelled) setReleases(data?.items || data?.data || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Unable to load releases')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReleases()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-bg py-20">
      <div className="fp-container">
        <div className="mb-10">
          <p className="special text-sm uppercase tracking-[0.28em] text-yellow">Coming Soon</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-black text-cream">
            Upcoming Releases
          </h2>
        </div>

        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div className="h-44 animate-pulse rounded-2xl bg-card" key={item} />
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyReleaseState message={`Unable to load releases: ${error}`} />
        )}

        {!loading && !error && releases.length === 0 && (
          <EmptyReleaseState message="No upcoming releases have been published yet." />
        )}

        {!loading && !error && releases.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {releases.map((release, index) => (
              <motion.article
                className="fandom-card group overflow-hidden p-5"
                initial={{ opacity: 0, y: 16 }}
                key={release._id}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow">
                  <CalendarClock size={14} /> {formatDate(release.releaseDate)}
                </p>
                <h3 className="mt-3 line-clamp-2 font-orbitron text-lg font-black text-cream">
                  {release.title}
                </h3>
                <p className="mt-3 text-sm text-muted">
                  {release.fandom} · {release.releaseType}
                </p>
                <Link className="mt-5 inline-flex text-sm font-bold text-primary transition group-hover:text-yellow" to="/releases">
                  Track release
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyReleaseState({ message }) {
  return (
    <motion.div
      className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/30 bg-primary/15">
        <Sparkles className="text-yellow" size={24} />
      </div>
      <p className="mt-4 text-sm text-muted">{message}</p>
    </motion.div>
  )
}
