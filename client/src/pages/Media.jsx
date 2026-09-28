import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Film,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { fetchMedia } from '../services/mediaApi'
import { CATEGORIES } from '../data/categories'
import {
  getMediaKind,
  getPlayableMediaUrl,
  getVerifiedImageUrl,
  hasPreviewSource,
  isDirectAudioUrl,
  isDirectVideoUrl,
} from '../utils/mediaAssets'
import mariaApi from '../services/mariaApi'
import audioHorizon from '../assets/audio-horizon.mp3'
import audioChasing from '../assets/audio-chasing.mp3'
import { applyContentAssetOverrides } from '../utils/fandomAssets'
import { getCharacterImage } from '../utils/characterImages'

const TYPE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
]

const PROJECT_CATEGORY_NAMES = CATEGORIES.map((category) => category.name)
const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]))
const CURATED_COLLECTION_KEY = 'phase2-initial'

const EXISTING_AUDIO_ITEMS = [
  {
    _id: 'local-audio-horizon-of-hope',
    title: 'Horizon of Hope',
    fandom: 'Anime',
    category: 'Anime',
    mediaType: 'audio',
    embedUrl: audioHorizon,
    thumbnailUrl: '/images/categories/category-anime.png',
    tags: ['anime', 'audio'],
  },
  {
    _id: 'local-audio-chasing-the-light',
    title: 'Chasing the Light',
    fandom: 'K-Pop',
    category: 'K-Pop',
    mediaType: 'audio',
    embedUrl: audioChasing,
    thumbnailUrl: '/images/categories/category-kpop.png',
    tags: ['k-pop', 'audio'],
  },
]

const LOCAL_CHARACTER_IMAGE_ITEMS = [
  { name: 'Batman', fandom: 'DC Comics', category: 'Comics', tags: ['batman', 'dc', 'character'] },
  { name: 'Spider-Man', fandom: 'Marvel', category: 'Comics', tags: ['spider-man', 'marvel', 'character'] },
  { name: 'Iron Man', fandom: 'Marvel', category: 'Comics', tags: ['iron-man', 'marvel', 'character'] },
  { name: 'Deadpool', fandom: 'Marvel', category: 'Comics', tags: ['deadpool', 'marvel', 'character'] },
  { name: 'Naruto Uzumaki', fandom: 'Naruto', category: 'Anime', tags: ['naruto', 'anime', 'character'] },
  { name: 'Son Goku', fandom: 'Dragon Ball', category: 'Anime', tags: ['goku', 'dragon-ball', 'character'] },
  { name: 'Levi Ackerman', fandom: 'Attack on Titan', category: 'Anime', tags: ['levi', 'attack-on-titan', 'character'] },
  { name: 'Gojo Satoru', fandom: 'Jujutsu Kaisen', category: 'Anime', tags: ['gojo', 'jujutsu-kaisen', 'character'] },
  { name: 'Monkey D. Luffy', fandom: 'One Piece', category: 'Anime', tags: ['luffy', 'one-piece', 'character'] },
  { name: 'Kratos', fandom: 'God of War', category: 'Gaming', tags: ['kratos', 'god-of-war', 'character'] },
  { name: 'Ellie Williams', fandom: 'The Last of Us', category: 'Gaming', tags: ['ellie', 'the-last-of-us', 'character'] },
].map((character) => {
  const image = getCharacterImage(character)
  return {
    _id: `local-character-image-${character.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: `${character.name} Portrait`,
    fandom: character.fandom,
    category: character.category,
    mediaType: 'image',
    thumbnailUrl: image,
    posterUrl: image,
    localOnly: true,
    tags: character.tags,
  }
})

function normalizeItems(response) {
  const payload = response?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.media)) return payload.media
  return []
}

function getContentVideoUrl(content) {
  const details = content?.details || {}
  return (
    details.featuredSong?.youtubeUrl ||
    details.featuredMedia?.url ||
    details.officialMediaUrl ||
    details.trailerUrl ||
    content?.videoUrl ||
    ''
  )
}

function mediaFromContent(content) {
  const hydrated = applyContentAssetOverrides(content)
  const playableUrl = getContentVideoUrl(hydrated)
  if (!playableUrl) return null

  const category = CATEGORY_BY_SLUG.get(hydrated.categorySlug)
  const image = getVerifiedImageUrl(hydrated.imageUrl, hydrated.imageUrls, hydrated.details?.posterUrl, hydrated.details?.bannerUrl)

  return {
    _id: `content-media-${hydrated._id || hydrated.slug}`,
    title: hydrated.details?.featuredSong?.title || hydrated.details?.featuredMedia?.title || `${hydrated.title} Official Video`,
    fandom: hydrated.title,
    category: category?.name || hydrated.categoryInfo?.name || hydrated.category || hydrated.categorySlug,
    mediaType: 'video',
    embedUrl: playableUrl,
    thumbnailUrl: image,
    posterUrl: image,
    releaseYear: hydrated.releaseYear,
    tags: [hydrated.categorySlug, hydrated.type, hydrated.slug].filter(Boolean),
    contentSlug: hydrated.slug,
  }
}

function uniqueMedia(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = [
      String(item?.title || '').toLowerCase().trim(),
      String(item?.embedUrl || item?.thumbnailUrl || item?._id || '').toLowerCase().trim(),
    ].join('|')

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getPrimaryImage(item) {
  return getVerifiedImageUrl(item?.thumbnailUrl, item?.posterUrl, item?.bannerUrl, item?.galleryUrls)
}

function getPlayableUrl(item) {
  return getPlayableMediaUrl(item?.embedUrl || item?.videoUrl || item?.audioUrl || item?.mediaUrl || item?.url)
}

function hasUsableMedia(item) {
  return Boolean(getPlayableUrl(item) || getPrimaryImage(item))
}

function normalizeMediaRecord(item) {
  const playableSource = item?.embedUrl || item?.videoUrl || item?.audioUrl || item?.mediaUrl || item?.url
  return {
    ...item,
    embedUrl: playableSource || item?.embedUrl,
  }
}

function matchesFilter(item, activeType) {
  if (activeType === 'all') return true
  return getMediaKind(item) === activeType
}

function Media() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewerItem, setViewerItem] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadMedia() {
      try {
        setLoading(true)
        setError('')
        const [mediaResult, contentResult] = await Promise.allSettled([
          fetchMedia({ limit: 100 }),
          mariaApi.get('/contents', { params: { collectionKey: CURATED_COLLECTION_KEY, limit: 100 } }),
        ])

        const dbMedia =
          mediaResult.status === 'fulfilled'
            ? normalizeItems(mediaResult.value).map(normalizeMediaRecord).filter((item) => hasPreviewSource(item) || hasUsableMedia(item))
            : []

        const contentMedia =
          contentResult.status === 'fulfilled'
            ? (contentResult.value?.data?.contents || []).map(mediaFromContent).filter(Boolean)
            : []

        if (!cancelled) setItems(uniqueMedia([...contentMedia, ...LOCAL_CHARACTER_IMAGE_ITEMS, ...EXISTING_AUDIO_ITEMS, ...dbMedia]))
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err.message || 'Unable to load media.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMedia()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!viewerItem) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setViewerItem(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [viewerItem])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    const selectedCategory = activeCategory.toLowerCase()

    return items.filter((item) => {
      const inType = matchesFilter(item, activeType)
      const inCategory =
        activeCategory === 'all' ||
        [item.category, item.fandom].some((value) => String(value || '').toLowerCase() === selectedCategory)

      const searchable = [
        item.title,
        item.fandom,
        item.category,
        item.mediaType,
        item.releaseYear,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return inType && inCategory && (!term || searchable.includes(term))
    })
  }, [activeCategory, activeType, items, search])

  const featured = items.find((item) => hasPreviewSource(item)) || items[0]

  return (
    <div className="bg-bg">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,0,107,0.22),transparent_32%),radial-gradient(circle_at_86%_8%,rgba(139,92,246,0.18),transparent_30%)]" />
        <div className="fp-container relative">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <p className="special text-sm uppercase tracking-[0.28em] text-yellow">
                Fandom Pulse Media
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(2.5rem,6vw,5.75rem)] font-black leading-none text-cream">
                Watch the fandom signal glow.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
                Browse trailers, video explainers and visual drops from the Fan Hub Plus media archive.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="btn-primary special" href="#media-gallery">
                  Explore gallery
                </a>
                <Link className="btn-secondary special" to="/explore">
                  Browse categories
                </Link>
              </div>
            </div>

            <FeaturedMediaCard item={featured} loading={loading} onOpen={setViewerItem} />
          </div>
        </div>
      </section>

      <section className="fp-container pb-20" id="media-gallery">
        <div className="surface-panel p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="ui-label text-xs uppercase tracking-[0.24em] text-yellow">Media Gallery</p>
              <h2 className="mt-2 text-2xl font-black text-cream md:text-3xl">
                Fandom images and videos
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto] lg:min-w-[520px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  className="min-h-12 w-full rounded-2xl border border-border bg-bg/80 py-3 pl-11 pr-4 text-sm text-cream outline-none transition focus:border-primary/70 focus:shadow-[0_0_0_3px_rgba(255,0,107,0.18)]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, fandom or tag"
                  type="search"
                  value={search}
                />
              </label>

              <label className="relative block">
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                <select
                  className="min-h-12 w-full appearance-none rounded-2xl border border-border bg-bg/80 py-3 pl-11 pr-10 text-sm text-cream outline-none transition focus:border-primary/70 focus:shadow-[0_0_0_3px_rgba(255,0,107,0.18)]"
                  onChange={(event) => setActiveCategory(event.target.value)}
                  value={activeCategory}
                >
                  <option value="all">All fandoms</option>
                  {PROJECT_CATEGORY_NAMES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {TYPE_FILTERS.map((filter) => (
              <button
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                  activeType === filter.value
                    ? 'border-primary bg-primary text-cream shadow-[0_0_20px_rgba(255,0,107,0.32)]'
                    : 'border-border bg-bg/70 text-muted hover:border-primary/70 hover:text-cream'
                }`}
                key={filter.value}
                onClick={() => setActiveType(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading && <MediaSkeleton />}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-primary/35 bg-card p-8 text-center">
              <AlertTriangle className="mx-auto text-yellow" size={34} />
              <h3 className="mt-4 font-orbitron text-xl font-bold text-cream">Unable to load media</h3>
              <p className="mt-2 text-sm text-muted">{error}</p>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              title="No media records are available yet."
              message="Media cards will appear here after valid records are added to MongoDB."
            />
          )}

          {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
            <EmptyState
              title="No media matches these filters."
              message="Try a different search term, media type or fandom filter."
            />
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item, index) => (
                <MediaCard item={item} key={item._id || `${item.title}-${index}`} onOpen={setViewerItem} />
              ))}
            </div>
          )}
        </div>
      </section>

      <MediaViewer item={viewerItem} onClose={() => setViewerItem(null)} />
    </div>
  )
}

function FeaturedMediaCard({ item, loading, onOpen }) {
  if (loading) {
    return (
      <div className="aspect-[4/3] animate-pulse rounded-[2rem] border border-border bg-card" />
    )
  }

  if (!item) {
    return (
      <div className="rounded-[2rem] border border-border bg-card/80 p-8 text-center">
        <Sparkles className="mx-auto text-yellow" size={34} />
        <h2 className="mt-4 font-orbitron text-2xl font-black text-cream">Featured media</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Add media records in MongoDB to activate the featured preview.
        </p>
      </div>
    )
  }

  const image = getPrimaryImage(item)
  const kind = getMediaKind(item)

  return (
    <button
      className="group relative block min-h-[360px] overflow-hidden rounded-[2rem] border border-primary/30 bg-card text-left shadow-[0_24px_70px_rgba(153,0,77,0.28)] transition duration-500 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_0_40px_rgba(255,0,107,0.28),0_28px_80px_rgba(153,0,77,0.34)]"
      onClick={() => onOpen(item)}
      type="button"
    >
      {image ? (
        <img
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          src={image}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,rgba(255,0,107,0.24),rgba(87,30,118,0.28))]">
          {kind === 'audio' ? <Headphones className="text-primary" size={76} /> : kind === 'video' ? <Film className="text-primary" size={76} /> : <ImageIcon className="text-primary" size={76} />}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#12000d] via-[#12000d]/50 to-transparent" />
      <div className="absolute left-5 top-5 rounded-full border border-cream/15 bg-bg/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-yellow backdrop-blur">
        Featured
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary text-cream shadow-lg shadow-primary/40 transition duration-300 group-hover:scale-110">
          {kind === 'audio' ? <Headphones size={21} /> : kind === 'video' ? <Play fill="currentColor" size={20} /> : <ImageIcon size={21} />}
        </div>
        <h2 className="font-orbitron text-2xl font-black leading-tight text-cream md:text-3xl">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {[item.fandom, item.category, item.releaseYear].filter(Boolean).join(' · ')}
        </p>
      </div>
    </button>
  )
}

function MediaCard({ item, onOpen }) {
  const image = getPrimaryImage(item)
  const kind = getMediaKind(item)

  return (
    <motion.article
      className="group overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_6px_28px_rgba(153,0,77,0.18)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_0_26px_rgba(255,0,107,0.3)]"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-60px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <button
        className="relative block aspect-[16/10] w-full overflow-hidden bg-bg text-left"
        onClick={() => onOpen(item)}
        type="button"
      >
        {image ? (
          <img
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            src={image}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,rgba(255,0,107,0.16),rgba(139,92,246,0.18))]">
            {kind === 'audio' ? <Headphones className="text-primary" size={46} /> : kind === 'video' ? <Film className="text-primary" size={46} /> : <ImageIcon className="text-primary" size={46} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12000d] via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-bg/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cream backdrop-blur">
          {kind === 'audio' ? <Headphones size={12} /> : kind === 'video' ? <Play fill="currentColor" size={11} /> : <ImageIcon size={12} />}
          {item.mediaType || kind}
        </span>
      </button>

      <div className="p-5">
        <h3 className="line-clamp-2 font-orbitron text-lg font-black leading-tight text-cream">
          {item.title}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {[item.fandom, item.category, item.releaseYear].filter(Boolean).join(' · ')}
        </p>
        {item.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span className="rounded-full border border-border px-3 py-1 text-[11px] text-muted" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            className="special text-sm font-bold text-yellow transition hover:text-primary"
            onClick={() => onOpen(item)}
            type="button"
          >
            Preview
          </button>
          {item._id && !item.localOnly ? (
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-cream"
              to={`/media/${item._id}`}
            >
              Details <ArrowRight size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

function MediaViewer({ item, onClose }) {
  const kind = getMediaKind(item)
  const image = getPrimaryImage(item)
  const playable = getPlayableUrl(item)
  const isDirectVideo = isDirectVideoUrl(playable)
  const isDirectAudio = isDirectAudioUrl(playable)

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-[#070007]/90 px-4 py-6 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-[0_0_50px_rgba(255,0,107,0.22)]"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close media preview"
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-cream/15 bg-bg/85 text-cream transition hover:border-primary hover:text-primary"
              onClick={onClose}
              type="button"
            >
              <X size={20} />
            </button>

            <div className="bg-bg">
              {kind === 'audio' && isDirectAudio ? (
                <div className="p-8 md:p-10">
                  {image ? (
                    <img
                      alt={item.title}
                      className="mb-6 max-h-[46vh] w-full rounded-2xl object-contain"
                      src={image}
                    />
                  ) : null}
                  <audio className="w-full" controls src={playable} />
                </div>
              ) : playable ? (
                isDirectVideo ? (
                  <video className="max-h-[76vh] w-full bg-black" controls poster={image || undefined} src={playable} />
                ) : (
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full"
                    src={playable}
                    title={item.title}
                  />
                )
              ) : image ? (
                <img
                  alt={item.title}
                  className="max-h-[76vh] w-full object-contain"
                  src={image}
                />
              ) : (
                <div className="grid min-h-[360px] place-items-center p-8 text-center">
                  <Loader2 className="mx-auto animate-spin text-primary" size={36} />
                  <p className="mt-4 text-sm text-muted">No preview source is available for this media record.</p>
                </div>
              )}
            </div>

            <div className="p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow">
                {[item.fandom, item.category].filter(Boolean).join(' · ') || 'Fan Hub Plus'}
              </p>
              <h3 className="mt-2 font-orbitron text-2xl font-black text-cream">{item.title}</h3>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function MediaSkeleton() {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="overflow-hidden rounded-2xl border border-border bg-card" key={item}>
          <div className="aspect-[16/10] animate-pulse bg-bg/80" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-bg" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-bg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ title, message }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-primary/35 bg-bg/45 p-10 text-center">
      <ImageIcon className="mx-auto text-primary" size={38} />
      <h3 className="mt-4 font-orbitron text-xl font-bold text-cream">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{message}</p>
    </div>
  )
}

export default Media
