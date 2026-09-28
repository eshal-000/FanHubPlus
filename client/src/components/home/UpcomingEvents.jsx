import { Calendar, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../services/authApi'

function formatDate(value) {
  if (!value) return 'Date TBA'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      try {
        setLoading(true)
        const { data } = await authApi.get('/events', {
          params: { limit: 3, timeFilter: 'upcoming' },
        })
        if (!cancelled) setEvents(data?.items || data?.data || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Unable to load events')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadEvents()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-bg-alt py-20">
      <div className="fp-container">
        <div className="mb-10">
          <p className="special text-sm uppercase tracking-[0.28em] text-yellow">Don't Miss Out</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-black text-cream">
            Upcoming Events
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
          <EmptyEventState message={`Unable to load events: ${error}`} />
        )}

        {!loading && !error && events.length === 0 && (
          <EmptyEventState message="No upcoming events have been published yet." />
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((event, index) => (
              <motion.article
                className="fandom-card group overflow-hidden p-5"
                initial={{ opacity: 0, y: 16 }}
                key={event._id}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow">
                  <Calendar size={14} /> {formatDate(event.startDate)}
                </p>
                <h3 className="mt-3 line-clamp-2 font-orbitron text-lg font-black text-cream">
                  {event.title}
                </h3>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <MapPin size={15} /> {event.city || 'Location TBA'}
                </p>
                <Link className="mt-5 inline-flex text-sm font-bold text-primary transition group-hover:text-yellow" to={`/events/${event._id}`}>
                  View event
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyEventState({ message }) {
  return (
    <motion.div
      className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/30 bg-primary/15">
        <Calendar className="text-yellow" size={24} />
      </div>
      <p className="mt-4 text-sm text-muted">{message}</p>
    </motion.div>
  )
}
