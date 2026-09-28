import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { fetchMediaById } from '../../services/mediaApi'
import CinematicHero from './CinematicHero.jsx'
import RelatedSidebar from './RelatedSidebar.jsx'
import CastSection from './CastSection.jsx'
import MovieDetails from './MovieDetails.jsx'
import TrailerModal from './TrailerModal.jsx'
import MediaRating from './MediaRating.jsx'

export default function MediaDetailsPage() {
  const { id } = useParams()
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trailerOpen, setTrailerOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchMediaById(id)
        if (!cancelled) setMedia(response.data.data || null)
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

    if (id) load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="aspect-[16/9] animate-pulse rounded-2xl bg-card" />
            <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-card" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-card" />
          </div>
          <div className="hidden lg:block">
            <div className="h-80 animate-pulse rounded-2xl bg-card" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-primary/40 bg-card p-8 text-center">
          <AlertTriangle className="mx-auto text-yellow" size={32} />
          <h1 className="mt-4 font-orbitron text-xl font-bold text-cream">
            Unable to load this media
          </h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <Link className="btn-primary special mt-6 inline-flex" to="/media">
            Back to Media
          </Link>
        </div>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted">Media not found.</p>
        <Link className="btn-secondary special mt-6 inline-flex" to="/media">
          Back to Media
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-bg">
      <div className="mx-auto max-w-[1400px] px-4 pt-8 pb-16">
        
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          
          <div className="min-w-0">
            <CinematicHero
              media={media}
              onWatchTrailer={() => setTrailerOpen(true)}
            />
            <CastSection cast={media.cast || []} />
          </div>

          
          <aside className="min-w-0">
            <RelatedSidebar currentId={media._id} category={media.category} />
          </aside>
        </div>

        
        <div className="mt-14">
          <MovieDetails media={media} />
          <MediaRating mediaId={media._id} />
        </div>
      </div>

      <TrailerModal
        embedUrl={media.embedUrl}
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={media.title}
      />
    </div>
  )
}