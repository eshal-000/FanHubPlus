import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { authApi } from '../../services/authApi'

export default function MediaRating({ mediaId }) {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    averageRating: 0,
    ratingCount: 0,
    userRating: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await authApi.get(`/media/${mediaId}/rating`)
        if (!cancelled) setStats(res.data)
      } catch {

      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (mediaId) load()
    return () => { cancelled = true }
  }, [mediaId])

  async function submit(value) {
    if (!isAuthenticated || saving) return
    try {
      setSaving(true)
      await authApi.post(`/media/${mediaId}/rating`, { value })
      const res = await authApi.get(`/media/${mediaId}/rating`)
      setStats(res.data)
    } catch {

    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-primary/25 bg-card p-6">
      <h2 className="font-orbitron text-lg font-bold uppercase tracking-wider text-yellow">
        Fan Rating
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              aria-label={`Rate ${n} stars`}
              className={`transition ${
                isAuthenticated
                  ? 'cursor-pointer hover:scale-110'
                  : 'cursor-default'
              }`}
              disabled={!isAuthenticated || saving}
              key={n}
              onClick={() => submit(n)}
              type="button"
            >
              <Star
                className={
                  (stats.userRating || 0) >= n
                    ? 'fill-yellow text-yellow'
                    : 'text-muted'
                }
                size={24}
              />
            </button>
          ))}
        </div>

        <div>
          <p className="text-base font-semibold text-cream">
            {loading ? '—' : stats.averageRating.toFixed(1)} / 5
          </p>
          <p className="text-xs text-muted">
            {stats.ratingCount}{' '}
            {stats.ratingCount === 1 ? 'rating' : 'ratings'}
          </p>
        </div>

        {!isAuthenticated && (
          <p className="text-xs text-muted">Log in to submit your rating.</p>
        )}
      </div>
    </section>
  )
}