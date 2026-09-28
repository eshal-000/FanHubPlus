import { motion } from 'framer-motion'
import { Play, Star, Clock, Calendar } from 'lucide-react'
import { getPlayableMediaUrl, getVerifiedImageUrl } from '../../utils/mediaAssets'

export default function CinematicHero({ media, onWatchTrailer }) {
  const banner = getVerifiedImageUrl(media.bannerUrl)
  const poster = getVerifiedImageUrl(media.posterUrl, media.thumbnailUrl)
  const trailerUrl = getPlayableMediaUrl(media.embedUrl)

  const year = media.releaseYear || null
  const runtime = media.runtimeMinutes ? `${media.runtimeMinutes} min` : null
  const genres = (media.genres || []).slice(0, 3)
  const hasRating = media.averageRating > 0

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card">
      
      <div className="absolute inset-0">
        {banner ? (
          <img
            alt={`${media.title} banner`}
            className="h-full w-full object-cover"
            src={banner}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'radial-gradient(ellipse at 20% 30%, rgba(153,0,77,0.65) 0%, rgba(35,0,24,0.98) 65%)',
            }}
          />
        )}
        
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(24,0,18,0.96) 0%, rgba(24,0,18,0.82) 45%, rgba(24,0,18,0.55) 100%)',
          }}
        />
      </div>

      
      <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_200px] lg:grid-cols-[1fr_220px] lg:items-center lg:p-10">
        
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.55 }}
        >
          {media.fandom && (
            <p className="special text-xs uppercase tracking-[0.28em] text-yellow">
              {media.fandom}
            </p>
          )}

          <h1 className="mt-2 font-orbitron text-[clamp(1.5rem,3.2vw,2.4rem)] font-black leading-[1.15] text-cream">
            {media.title}
          </h1>

          
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            {year && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-yellow" />
                {year}
              </span>
            )}
            {runtime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} className="text-yellow" />
                {runtime}
              </span>
            )}
            {hasRating && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="fill-yellow text-yellow" size={13} />
                <span className="text-cream">{media.averageRating.toFixed(1)}</span>
                <span className="text-muted/70">({media.ratingCount})</span>
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((g) => (
                <span
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-cream"
                  key={g}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {media.synopsis && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-cream/80 line-clamp-4">
              {media.synopsis}
            </p>
          )}

          {trailerUrl && (
            <div className="mt-6">
              <button
                className="btn-primary special inline-flex items-center gap-2 text-sm"
                onClick={onWatchTrailer}
                type="button"
              >
                <Play fill="currentColor" size={15} /> Watch Trailer
              </button>
            </div>
          )}
        </motion.div>

        
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-[140px] sm:w-[160px] md:mx-0 md:w-full"
          initial={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-primary/35 shadow-[0_16px_50px_rgba(255,0,107,0.30)]">
            {poster ? (
              <img
                alt={`${media.title} poster`}
                className="h-full w-full object-cover"
                src={poster}
              />
            ) : (
              <div
                className="grid h-full w-full place-items-center p-3"
                style={{
                  background:
                    'linear-gradient(135deg, #390B2B 0%, #99004D 60%, #FF006B 120%)',
                }}
              >
                <span className="text-center font-orbitron text-[0.7rem] font-bold uppercase tracking-widest text-cream/85">
                  {media.title}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
