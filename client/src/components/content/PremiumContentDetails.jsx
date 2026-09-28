import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiBookmark,
  FiClock,
  FiExternalLink,
  FiFilm,
  FiGlobe,
  FiGrid,
  FiHeart,
  FiImage,
  FiInfo,
  FiLayers,
  FiMic,
  FiPause,
  FiPlay,
  FiShare2,
  FiStar,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { asArray, categoryLabel, formatDate, imageFor, joinList, posterFor, splitParagraphs } from '../../utils/contentDisplay'
import { getYouTubeEmbedUrl } from '../../utils/youtube'

const TYPE_LABELS = {
  anime: 'Anime',
  comic: 'Comic',
  cosplay: 'Cosplay',
  game: 'Game',
  'k-pop': 'K-Pop',
  manga: 'Manga',
  movie: 'Movie',
  'tv-show': 'TV Show',
}

const DEFAULT_ANIME_VOICES = [
  {
    audioUrl: '',
    characterName: 'Son Goku',
    notes: 'Correct source clip not found. The supplied Dragon Ball file is labeled Gohan SSJ2 and is not used for this card.',
    rightsStatus: 'needs-review',
    seriesName: 'Dragon Ball',
    sourceFile: '',
  },
  {
    audioUrl: '/audios/anime-voices/naruto-uzumaki-kage-bunshin.mp3',
    characterName: 'Naruto Uzumaki',
    notes: 'Mapped from "kage bunshin no jutsu Naruto - QuickSounds.com.mp3".',
    rightsStatus: 'needs-review',
    seriesName: 'Naruto',
    sourceFile: 'kage bunshin no jutsu Naruto - QuickSounds.com.mp3',
  },
  {
    audioUrl: '/audios/anime-voices/monkey-d-luffy-looking-for-crew-members.mp3',
    characterName: 'Monkey D. Luffy',
    notes: 'Mapped from "my-name-is-luffy-and-i-am-looking-for-crew-members.mp3".',
    rightsStatus: 'needs-review',
    seriesName: 'One Piece',
    sourceFile: 'my-name-is-luffy-and-i-am-looking-for-crew-members.mp3',
  },
  {
    audioUrl: '/audios/anime-voices/mikasa-ackerman-love.mp3',
    characterName: 'Mikasa Ackerman',
    notes: 'Mapped from "mikasa-says-she-learned-how-to-love.mp3".',
    rightsStatus: 'needs-review',
    seriesName: 'Attack on Titan',
    sourceFile: 'mikasa-says-she-learned-how-to-love.mp3',
  },
  {
    audioUrl: '/audios/anime-voices/hinata-hyuga-konnichiwa.mp3',
    characterName: 'Hinata Hyuga',
    notes: 'Mapped from the Hinata source MP3; exact line still needs review.',
    rightsStatus: 'needs-review',
    seriesName: 'Naruto',
    sourceFile: '[hinata]\u3053\u3093\u306b\u3061\u306f......\u3055\u3044\u306d\u3002_.mp3',
  },
]

const CATEGORY_INFO = {
  anime: {
    guide: 'Anime Series Guide',
    people: 'Characters & Creators',
    description: 'Story, characters and production notes',
    facts: [
      ['Original title', 'originalTitle'],
      ['Release', 'yearLabel'],
      ['Studio', 'studios', 'list'],
      ['Creators', 'creators', 'list'],
      ['Country', 'country'],
      ['Languages', 'languages', 'list'],
      ['Formats', 'formats', 'list'],
    ],
    lists: [
      ['Main characters', 'characters'],
      ['Formats', 'formats'],
    ],
  },
  gaming: {
    guide: 'Game Guide',
    people: 'Creators & Characters',
    description: 'Overview, gameplay and development',
    facts: [
      ['Developer', 'developer'],
      ['Publisher', 'publisher'],
      ['Release', 'yearLabel'],
      ['Platforms', 'platforms', 'list'],
      ['Genres', 'genres', 'list'],
    ],
    lists: [
      ['Gameplay features', 'features'],
      ['Main characters', 'characters'],
    ],
  },
  movies: {
    guide: 'Film Guide',
    people: 'Director & Cast',
    description: 'Synopsis, cast and production background',
    facts: [
      ['Original title', 'originalTitle'],
      ['Release', 'yearLabel'],
      ['Country', 'country'],
      ['Languages', 'languages', 'list'],
      ['Genres', 'genres', 'list'],
      ['Runtime', 'runtimeMinutes', 'runtime'],
      ['Director', 'director'],
      ['Studio', 'studios', 'list'],
    ],
    lists: [['Main characters', 'characters']],
  },
  'tv-shows': {
    guide: 'Show Guide',
    people: 'Creators & Cast',
    description: 'Storyline, episodes and production',
    facts: [
      ['Original title', 'originalTitle'],
      ['Release', 'yearLabel'],
      ['Country', 'country'],
      ['Languages', 'languages', 'list'],
      ['Creators', 'creators', 'list'],
      ['Seasons', 'seasons'],
      ['Episodes', 'episodes'],
    ],
    lists: [['Main characters', 'characters']],
  },
  'k-pop': {
    guide: 'Group Guide',
    people: 'Members',
    description: 'Biography, members and selected music',
    facts: [
      ['Debut', 'debutDate'],
      ['Agency', 'agency'],
      ['Origin', 'origin'],
      ['Selected releases', 'selectedReleases', 'list'],
    ],
    lists: [['Selected releases', 'selectedReleases']],
  },
  comics: {
    guide: 'Comics Guide',
    people: 'Creators & Characters',
    description: 'Story, creators and publication notes',
    facts: [
      ['Creators', 'creators', 'list'],
      ['Publisher', 'publisher'],
      ['Publication', 'yearLabel'],
      ['Country', 'country'],
      ['Notable publications', 'notablePublications', 'list'],
    ],
    lists: [
      ['Main characters', 'characters'],
      ['Notable publications', 'notablePublications'],
    ],
  },
  manga: {
    guide: 'Manga Guide',
    people: 'Creators & Characters',
    description: 'Story, creators and publication notes',
    facts: [
      ['Japanese title', 'originalTitle'],
      ['Creator', 'creators', 'list'],
      ['Publisher', 'publisher'],
      ['Publication', 'yearLabel'],
      ['Volumes', 'volumes'],
    ],
    lists: [['Main characters', 'characters']],
  },
  cosplay: {
    guide: 'Outfit Guide',
    people: 'Inspiration & Build Pieces',
    description: 'Outfit inspiration, styling and materials',
    facts: [['Outfit concept', 'outfitConcept']],
    lists: [
      ['Clothing', 'clothing'],
      ['Accessories', 'accessories'],
      ['Materials', 'materials'],
      ['Styling ideas', 'stylingIdeas'],
    ],
  },
}

function isCoverCategory(content) {
  return ['comics', 'manga'].includes(content.categorySlug)
}

function shouldShowCoverCard(content) {
  return Boolean(posterFor(content))
}

function Badge({ children, color }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}66`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  )
}

function Section({ children, icon: Icon = FiLayers, title, subtitle }) {
  if (!children) return null
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/45 p-5 shadow-[0_0_30px_rgba(255,0,107,0.08)] backdrop-blur-md md:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] shadow-[0_0_20px_var(--glow)]">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="font-orbitron text-lg font-black uppercase tracking-wider text-[var(--cream)] md:text-xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function EmptyVisual({ label = 'Media pending' }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,107,0.20),transparent_38%),linear-gradient(135deg,rgba(153,0,77,0.18),rgba(24,0,18,0.92))] p-6 text-center">
      <FiImage className="text-[var(--primary)]" size={42} />
      <p className="font-orbitron text-xs font-bold uppercase tracking-[0.22em] text-[var(--cream)]">
        {label}
      </p>
      <p className="max-w-xs text-xs leading-6 text-[var(--muted)]">
        Admins can add verified media from the Content Manager. No substitute artwork is shown here.
      </p>
    </div>
  )
}

function MainMedia({ content }) {
  const details = content.details || {}
  const type = content.categorySlug
  const image = imageFor(content)
  const featuredMedia = details.featuredMedia || {}
  const featuredSong = details.featuredSong || {}

  const preferredVideo =
    type === 'k-pop'
      ? featuredSong.youtubeUrl || details.officialMediaUrl || featuredMedia.url || content.videoUrl
      : ['movies', 'tv-shows'].includes(type)
        ? details.trailerUrl || content.videoUrl || featuredMedia.url
        : ''
  const embedUrl = getYouTubeEmbedUrl(preferredVideo)
  const shouldUseVideo =
    Boolean(embedUrl) &&
    (['movies', 'tv-shows', 'k-pop'].includes(type) || featuredMedia.type === 'youtube')
  if (isCoverCategory(content) && !shouldUseVideo) return null
  if (!shouldUseVideo && !image) {
    return <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/45 p-5 text-sm text-[var(--muted)]">Verified media is being prepared for this title.</p>
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--primary)]/35 bg-[var(--surface)]/45 shadow-[0_0_44px_rgba(255,0,107,0.16)]">
      <div className="aspect-video w-full bg-[var(--nav)]">
        {shouldUseVideo ? (
          <iframe
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={embedUrl}
            title={featuredSong.title || featuredMedia.title || `${content.title} official media`}
          />
        ) : image ? (
          <img alt={content.title} className="h-full w-full object-cover" src={image} />
        ) : (
          <EmptyVisual label={['movies', 'tv-shows', 'k-pop'].includes(type) ? 'Official media pending' : 'Featured image pending'} />
        )}
      </div>
      {(featuredSong.title || featuredSong.description || featuredMedia.title || featuredMedia.description) && (
        <div className="border-t border-[var(--border)] bg-[var(--nav)]/45 p-4">
          <p className="font-orbitron text-sm font-bold text-[var(--cream)]">
            {featuredSong.title || featuredMedia.title}
          </p>
          {(featuredSong.description || featuredMedia.description) && (
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {featuredSong.description || featuredMedia.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function PosterCard({ content, color }) {
  const poster = posterFor(content)
  const details = content.details || {}
  const coverCategory = isCoverCategory(content)
  if (!poster && coverCategory) return null
  const visualLabel = coverCategory ? 'cover artwork' : 'poster or cover'

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/45 shadow-[0_0_32px_rgba(255,0,107,0.10)]">
      <div className={`${coverCategory ? 'aspect-[3/4]' : 'aspect-[2/3]'} bg-[var(--nav)]`}>
        {poster ? (
          <img alt={`${content.title} ${visualLabel}`} className="h-full w-full object-cover" src={poster} />
        ) : (
          <EmptyVisual label={coverCategory ? 'Cover artwork pending' : 'Poster pending'} />
        )}
      </div>
      {(details.originalTitle || details.yearLabel || content.releaseYear) && (
        <div className="space-y-2 p-4 text-sm">
          {details.originalTitle && <InfoRow label="Original" value={details.originalTitle} />}
          <InfoRow label="Release" value={details.yearLabel || content.releaseYear} />
        </div>
      )}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, var(--primary), ${color})` }} />
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)]/70 pb-2 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-widest text-[var(--muted)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--cream)]">{value}</dd>
    </div>
  )
}

function RelatedPanel({ items }) {
  const related = asArray(items).filter((item) => item && (item.status === 'published' || !item.status))
  if (!related.length) return null

  return (
    <Section icon={FiGrid} title="Related">
      <div className="grid gap-3">
        {related.map((item) => (
          <Link
            className="group grid grid-cols-[72px_1fr] gap-3 rounded-2xl border border-[var(--border)] bg-[var(--nav)]/45 p-2 transition hover:border-[var(--primary)] hover:shadow-[0_0_20px_var(--glow)]"
            key={item._id}
            to={`/content/${item.slug || item._id}`}
          >
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
              {item.imageUrl ? (
                <img alt={item.title} className="h-full w-full object-cover" src={item.imageUrl} />
              ) : (
                <div className="grid h-full place-items-center text-[var(--primary)]">
                  <FiFilm />
                </div>
              )}
            </div>
            <div className="min-w-0 py-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--yellow)]">
                {TYPE_LABELS[item.type] || item.type}
              </p>
              <h3 className="mt-1 line-clamp-2 font-orbitron text-sm font-bold text-[var(--cream)] group-hover:text-[var(--primary)]">
                {item.title}
              </h3>
              {item.releaseYear && <p className="mt-1 text-xs text-[var(--muted)]">{item.releaseYear}</p>}
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}

function PeopleCards({ content }) {
  const config = CATEGORY_INFO[content.categorySlug] || {}
  const details = content.details || {}
  const people = asArray(content.contributors)
  const characterRows = asArray(details.characters).map((name) => ({ characterName: name, role: 'Character' }))
  const rows = people.length ? people : characterRows
  if (!rows.length) return null

  return (
    <Section icon={FiUsers} title={config.people || 'People'}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((person, index) => {
          const displayName = person.name || person.characterName
          return (
            <article
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--nav)]/45 transition hover:-translate-y-1 hover:border-[var(--primary)]/70 hover:shadow-[0_0_24px_rgba(255,0,107,0.18)]"
              key={`${displayName}-${index}`}
            >
               <div className={`${person.imageUrl ? 'aspect-[4/3]' : 'h-24'} bg-[var(--surface)]`}>
                {person.imageUrl ? (
                  <img alt={displayName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={person.imageUrl} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--muted)]">
                    <FiUser className="text-[var(--primary)]" size={30} />
                    <span className="text-xs uppercase tracking-widest">Image pending</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-orbitron text-sm font-bold text-[var(--cream)]">{displayName}</p>
                {[person.role, person.characterName && person.name ? `as ${person.characterName}` : '']
                  .filter(Boolean)
                  .map((line) => (
                    <p className="mt-1 text-xs text-[var(--muted)]" key={line}>{line}</p>
                  ))}
                {person.bio && <p className="mt-3 line-clamp-3 text-xs leading-6 text-[var(--muted)]">{person.bio}</p>}
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}

function MetadataGrid({ content }) {
  const details = content.details || {}
  const config = CATEGORY_INFO[content.categorySlug] || {}
  const common = [
    ['Category', categoryLabel(content)],
    ['Type', TYPE_LABELS[content.type] || content.type],
    ['Release', details.yearLabel || content.releaseYear || formatDate(content.releaseDate)],
    ['Rating', content.rating !== null && content.rating !== undefined ? `${content.rating}/5` : ''],
    ['Views', Number.isFinite(content.views) ? content.views.toLocaleString() : ''],
  ]

  const specific = asArray(config.facts).map(([label, key, kind]) => {
    const value = details[key]
    if (kind === 'list') return [label, joinList(value)]
    if (kind === 'runtime') return [label, value ? `${value} min` : details.duration]
    return [label, value]
  })

  const rows = [...specific, ...common].filter(([, value]) => value || value === 0)
  if (!rows.length) return null

  return (
    <Section icon={FiInfo} title={config.guide || 'Details'}>
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value], index) => (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--nav)]/35 p-4" key={`${label}-${index}`}>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{label}</dt>
            <dd className="mt-2 text-sm font-semibold leading-6 text-[var(--cream)]">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

function RichDescription({ content }) {
  const details = content.details || {}
  const config = CATEGORY_INFO[content.categorySlug] || {}
  const panels = asArray(details.descriptionPanels)
  const fallbackText = content.body || content.description
  const lists = asArray(config.lists)
    .map(([label, key]) => [label, asArray(details[key])])
    .filter(([, items]) => items.length)

  if (!panels.length && !fallbackText && !lists.length) return null

  return (
    <Section icon={FiLayers} title={config.description || 'About'}>
      <div className="grid gap-5">
        {fallbackText && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--nav)]/35 p-5">
            {splitParagraphs(fallbackText).map((line, index) => (
              <p className="mb-4 text-[15px] leading-8 text-[var(--muted)] last:mb-0" key={index}>
                {line}
              </p>
            ))}
          </div>
        )}
        {panels.map((panel, index) => (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--nav)]/35 p-5" key={`${panel.title}-${index}`}>
            {panel.title && <h3 className="font-orbitron text-base font-bold text-[var(--cream)]">{panel.title}</h3>}
            {panel.body && <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[var(--muted)]">{panel.body}</p>}
            {asArray(panel.items).length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {panel.items.map((item) => (
                  <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 px-4 py-3 text-sm text-[var(--muted)]" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {lists.map(([label, items]) => (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--nav)]/35 p-5" key={label}>
            <h3 className="font-orbitron text-base font-bold text-[var(--cream)]">{label}</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 px-4 py-3 text-sm text-[var(--muted)]" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Gallery({ content }) {
  const used = new Set([imageFor(content), posterFor(content)].filter(Boolean))
  const gallery = asArray(content.imageUrls).filter((url) => !used.has(url))
  if (!gallery.length) return null

  return (
    <Section icon={FiImage} title="Gallery">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {gallery.map((url) => (
          <a
            className="group aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--nav)]/50 transition hover:border-[var(--primary)] hover:shadow-[0_0_22px_var(--glow)]"
            href={url}
            key={url}
            rel="noreferrer"
            target="_blank"
          >
            <img alt={`${content.title} gallery`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" src={url} />
          </a>
        ))}
      </div>
    </Section>
  )
}

function ExternalLinks({ links }) {
  const rows = asArray(links).filter((link) => link?.url)
  if (!rows.length) return null

  return (
    <Section icon={FiExternalLink} title="References">
      <div className="flex flex-wrap gap-2">
        {rows.map((link) => (
          <a
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--nav)]/55 px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--cream)]"
            href={link.url}
            key={`${link.label}-${link.url}`}
            rel="noreferrer"
            target="_blank"
          >
            {link.label || link.type || 'Source'} <FiExternalLink size={12} />
          </a>
        ))}
      </div>
    </Section>
  )
}

function AnimeVoicesPanel({ voices }) {
  const rows = asArray(voices).filter((voice) => voice?.characterName)
  const refs = useRef([])
  const [playing, setPlaying] = useState(null)
  const [progress, setProgress] = useState({})
  const [elapsed, setElapsed] = useState({})
  const [durations, setDurations] = useState({})
  const [loadingAudio, setLoadingAudio] = useState(null)
  const [audioErrors, setAudioErrors] = useState({})
  if (!rows.length) return null

  const toggle = async (index) => {
    const audio = refs.current[index]
    if (!audio) return
    refs.current.forEach((item, itemIndex) => {
      if (item && itemIndex !== index) item.pause()
    })
    if (audio.paused) {
      setLoadingAudio(index)
      setAudioErrors((current) => ({ ...current, [index]: '' }))
      try {
        await audio.play()
        setPlaying(index)
      } catch {
        setPlaying(null)
        setAudioErrors((current) => ({ ...current, [index]: 'Audio could not be played.' }))
      } finally {
        setLoadingAudio(null)
      }
    } else {
      audio.pause()
      setPlaying(null)
    }
  }

  const formatTime = (seconds) => Number.isFinite(seconds)
    ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
    : '0:00'

  return (
    <Section icon={FiMic} title="Iconic Anime Voices" subtitle="A cross-series Anime showcase; clips may not feature in this title. Audio rights must be reviewed before public deployment.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((voice, index) => {
          const pct = progress[index] || 0
          const hasAudio = Boolean(voice.audioUrl)
          const rightsLabel = {
            cleared: 'Rights cleared',
            restricted: 'Restricted',
            'needs-review': 'Needs rights review',
            unknown: 'Rights unknown',
          }[voice.rightsStatus || 'unknown']
          return (
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--nav)]/45 p-4" key={`${voice.characterName}-${index}`}>
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  {voice.imageUrl ? (
                    <img alt={voice.characterName} className="h-full w-full object-cover" src={voice.imageUrl} />
                  ) : (
                    <div className="grid h-full place-items-center text-[var(--primary)]">
                      <FiMic size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-orbitron text-sm font-bold text-[var(--cream)]">{voice.characterName}</h3>
                  {voice.seriesName && <p className="mt-1 text-xs text-[var(--muted)]">{voice.seriesName}</p>}
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--yellow)]">{rightsLabel}</p>
                </div>
              </div>
              {voice.notes && <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{voice.notes}</p>}
              <div className="mt-4 flex items-center gap-3">
                <button
                  aria-label={`${playing === index ? 'Pause' : 'Play'} ${voice.characterName}`}
                  className="grid h-10 w-10 place-items-center rounded-full bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] disabled:cursor-not-allowed disabled:bg-[var(--border)] disabled:text-[var(--muted)] disabled:shadow-none"
                  disabled={!hasAudio || loadingAudio === index}
                  onClick={() => toggle(index)}
                  type="button"
                >
                  {playing === index ? <FiPause /> : <FiPlay />}
                </button>
                <div aria-label={`${voice.characterName} audio progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(pct)} className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]" role="progressbar">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
                </div>
              </div>
              {hasAudio && <p className="mt-2 text-right text-xs tabular-nums text-[var(--muted)]">{loadingAudio === index ? 'Loading audio...' : `${formatTime(elapsed[index] || 0)} / ${formatTime(durations[index])}`}</p>}
              {audioErrors[index] && <p className="mt-2 text-xs text-red-300" role="alert">{audioErrors[index]}</p>}
              {!hasAudio && <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Audio source pending</p>}
              {hasAudio && (
                <audio
                  onEnded={() => setPlaying(null)}
                  onError={() => { setPlaying(null); setLoadingAudio(null); setAudioErrors((current) => ({ ...current, [index]: 'Audio file is unavailable.' })) }}
                  onLoadedMetadata={(event) => {
                    const duration = event.currentTarget.duration
                    setDurations((current) => ({ ...current, [index]: duration }))
                  }}
                  onPause={() => setPlaying((current) => (current === index ? null : current))}
                  onPlay={() => setPlaying(index)}
                  onTimeUpdate={(event) => {
                    const audio = event.currentTarget
                    const next = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
                    const currentTime = audio.currentTime
                    setProgress((current) => ({ ...current, [index]: next }))
                    setElapsed((current) => ({ ...current, [index]: currentTime }))
                  }}
                  preload="metadata"
                  ref={(node) => {
                    refs.current[index] = node
                  }}
                  src={voice.audioUrl}
                />
              )}
            </article>
          )
        })}
      </div>
    </Section>
  )
}

export default function PremiumContentDetails({ content, onBookmark, onShare, saved }) {
  const navigate = useNavigate()
  const details = content.details || {}
  const category = content.categoryInfo || {}
  const color = category.color || 'var(--primary)'
  const config = CATEGORY_INFO[content.categorySlug] || {}
  const hasRating = content.rating !== null && content.rating !== undefined && content.rating !== ''
  const animeVoices = asArray(details.animeVoices).length ? details.animeVoices : DEFAULT_ANIME_VOICES
  const showCoverCard = shouldShowCoverCard(content)
  const liftRelated = isCoverCategory(content) && !showCoverCard && asArray(content.relatedContent).some((item) => item?.status === 'published')

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)]">
      <section
        className="relative overflow-hidden border-b border-[var(--border)]"
        style={{ background: `linear-gradient(135deg, ${color}18 0%, var(--bg) 58%, var(--bg) 100%)` }}
      >
        <div className="pointer-events-none absolute -left-28 top-0 h-[34rem] w-[34rem] rounded-full opacity-20 blur-[140px]" style={{ backgroundColor: color }} />
        <div className="pointer-events-none absolute -right-28 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[var(--raspberry)] opacity-15 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--nav)]/80 px-4 py-2 text-sm font-semibold text-[var(--cream)] backdrop-blur-md transition hover:border-[var(--primary)]"
            onClick={() => navigate(-1)}
            type="button"
          >
            <FiArrowLeft size={14} /> Back
          </button>
          <nav aria-label="Breadcrumb" className="mt-4 hidden items-center gap-2 text-xs text-[var(--muted)] md:flex">
            <Link className="hover:text-[var(--primary)]" to="/explore">Explore</Link>
            <span>/</span>
            <Link className="hover:text-[var(--primary)]" to={`/explore/${content.categorySlug}`}>{categoryLabel(content)}</Link>
            <span>/</span>
            <span className="text-[var(--cream)]">{content.title}</span>
          </nav>
        </div>

        <div className={`relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-10 ${showCoverCard || liftRelated ? 'lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,340px)]' : ''}`}>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge color={color}>{categoryLabel(content)}</Badge>
              <Badge color="var(--yellow)">{TYPE_LABELS[content.type] || content.type}</Badge>
            </div>
            <div>
              <h1 className="font-orbitron text-4xl font-black leading-tight text-[var(--cream)] md:text-6xl">
                {content.title}
              </h1>
              {(details.originalTitle || details.subtitle) && (
                <p className="mt-3 text-lg text-[var(--muted)]">{details.originalTitle || details.subtitle}</p>
              )}
            </div>
            {content.description && <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">{content.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              {(details.yearLabel || content.releaseYear) && <span className="inline-flex items-center gap-2"><FiClock className="text-[var(--primary)]" />{details.yearLabel || content.releaseYear}</span>}
              {details.country && <span className="inline-flex items-center gap-2"><FiGlobe className="text-[var(--primary)]" />{details.country}</span>}
              {hasRating && <span className="inline-flex items-center gap-2"><FiStar className="text-[var(--yellow)]" />{content.rating}/5</span>}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  saved
                    ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)]'
                    : 'border border-[var(--border)] bg-[var(--surface)]/50 text-[var(--cream)] hover:border-[var(--primary)]'
                }`}
                onClick={onBookmark}
                type="button"
              >
                <FiBookmark className={saved ? 'fill-current' : ''} /> {saved ? 'Saved' : 'Save'}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-5 py-2.5 text-sm font-bold text-[var(--cream)] transition hover:border-[var(--primary)]"
                onClick={onShare}
                type="button"
              >
                <FiShare2 /> Share
              </button>
            </div>
            <MainMedia content={content} />
          </div>
          {showCoverCard && (
            <aside className="grid gap-5 self-start sm:max-w-sm md:grid-cols-2 lg:max-w-none lg:grid-cols-1">
              <PosterCard color={color} content={content} />
            </aside>
          )}
          {liftRelated && <aside className="hidden self-center lg:block"><RelatedPanel items={content.relatedContent} /></aside>}
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-7 px-4 py-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="flex min-w-0 flex-col gap-7">
          <PeopleCards content={content} />
          <MetadataGrid content={content} />
          <RichDescription content={content} />
          {content.categorySlug === 'anime' && <AnimeVoicesPanel voices={animeVoices} />}
          <Gallery content={content} />
        </div>
        <aside className="flex min-w-0 flex-col gap-7 self-start">
          <div className={liftRelated ? 'lg:hidden' : ''}><RelatedPanel items={content.relatedContent} /></div>
          <Section icon={FiInfo} title="Quick Info" subtitle={config.guide}>
            <dl className="space-y-3">
              <InfoRow label="Category" value={categoryLabel(content)} />
              <InfoRow label="Type" value={TYPE_LABELS[content.type] || content.type} />
              <InfoRow label="Release" value={details.yearLabel || content.releaseYear || formatDate(content.releaseDate)} />
              <InfoRow label="Languages" value={joinList(details.languages)} />
              <InfoRow label="Genres" value={joinList(details.genres)} />
              <InfoRow label="Platforms" value={joinList(details.platforms)} />
              <InfoRow label="Agency" value={details.agency} />
            </dl>
          </Section>
          <ExternalLinks links={content.externalLinks} />
          {content.tags?.length > 0 && (
            <Section icon={FiHeart} title="Tags">
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--nav)]/55 px-3 py-1.5 text-xs text-[var(--muted)]" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </aside>
      </main>
    </div>
  )
}
