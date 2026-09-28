import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiClock, FiFilm, FiGlobe, FiPlay, FiUser, FiUsers, FiBookmark, FiShare2 } from 'react-icons/fi'

function Portrait({ name, url, color }) {
  return url ? (
    <img alt={name} className="h-16 w-16 rounded-full border-2 object-cover" src={url} style={{ borderColor: `${color}60` }} />
  ) : (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-orbitron text-xl font-bold" style={{ backgroundColor: `${color}25`, borderColor: `${color}60`, color }} aria-label={name}>
      {name?.charAt(0) || '?'}
    </div>
  )
}

export default function MovieContentDetails({ content, saved, onBookmark, onShare }) {
  const navigate = useNavigate()
  const details = content.details || {}
  const color = content.categoryInfo?.color || '#F59E0B'
  const poster = details.posterUrl || content.imageUrl || content.imageUrls?.[0]
  const cast = (content.contributors || []).filter((person) => /cast|actor|voice|performer/i.test(person.role || '') || person.characterName)
  const directors = (content.contributors || []).filter((person) => /director/i.test(person.role || ''))
  const related = (content.relatedContent || []).filter((item) => item && item.categorySlug === 'movies' && item.status === 'published')
  const runtime = details.runtimeMinutes ? `${details.runtimeMinutes} min` : details.duration
  const languages = (details.languages || []).join(', ')
  const gallery = [...new Set((content.imageUrls || []).filter((url) => url && url !== poster))]
  const officialMedia = [content.videoUrl, details.trailerUrl].filter(Boolean)[0]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <section className="relative overflow-hidden border-b border-[var(--border)]" style={{ background: `linear-gradient(135deg, ${color}18, var(--bg) 55%)` }}>
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: color }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6">
          <button className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--nav)]/80 px-4 py-2 text-sm text-[var(--cream)]" onClick={() => navigate('/explore/movies')} type="button"><FiArrowLeft /> Back to Movies</button>
          <nav aria-label="Breadcrumb" className="mt-4 flex gap-2 text-xs text-[var(--muted)]"><Link to="/explore">Explore</Link><span>/</span><Link to="/explore/movies">Movies</Link><span>/</span><span className="text-[var(--cream)]">{content.title}</span></nav>
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
          <div className="mx-auto aspect-[2/3] w-[200px] overflow-hidden rounded-2xl border-2 bg-[var(--surface)] md:w-full" style={{ borderColor: `${color}40` }}>
            {poster ? <img alt={`${content.title} poster`} className="h-full w-full object-cover" src={poster} /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--muted)]"><FiFilm size={40} /><span>Poster not available</span></div>}
          </div>
          <div>
            <span className="rounded-full border px-3 py-1 text-xs font-bold uppercase" style={{ color, borderColor: `${color}60` }}>Movie</span>
            <h1 className="mt-4 font-orbitron text-3xl font-black text-[var(--cream)] md:text-5xl">{content.title}</h1>
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-[var(--muted)]">
              {(details.yearLabel || content.releaseYear) && <span className="flex items-center gap-2"><FiCalendar />{details.yearLabel || content.releaseYear}</span>}
              {runtime && <span className="flex items-center gap-2"><FiClock />{runtime}</span>}
              {details.country && <span className="flex items-center gap-2"><FiGlobe />{details.country}</span>}
            </div>
            {details.genres?.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{details.genres.map((genre) => <span className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-1 text-xs text-[var(--muted)]" key={genre}>{genre}</span>)}</div>}
            {officialMedia && <a className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold text-[var(--cream)]" href={officialMedia} rel="noreferrer" target="_blank"><FiPlay /> Watch Official Media</a>}
            <div className="mt-6 flex gap-3 text-sm"><button className="rounded-full border border-[var(--border)] px-4 py-2 text-[var(--cream)]" onClick={onBookmark} type="button"><FiBookmark className="mr-2 inline" />{saved ? 'Saved' : 'Save'}</button><button className="rounded-full border border-[var(--border)] px-4 py-2 text-[var(--cream)]" onClick={onShare} type="button"><FiShare2 className="mr-2 inline" />Share</button></div>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-9">
          {(content.body || content.description) && <section><h2 className="mb-4 font-orbitron text-xl font-bold text-[var(--cream)]">Synopsis</h2><p className="whitespace-pre-line leading-8 text-[var(--muted)]">{content.body || content.description}</p></section>}
          {(details.director || directors.length > 0) && <section><h2 className="mb-4 flex items-center gap-2 font-orbitron text-xl font-bold text-[var(--cream)]"><FiUser className="text-[var(--primary)]" /> {directors.length > 1 ? 'Directors' : 'Director'}</h2><div className="grid gap-3 sm:grid-cols-2">{(directors.length ? directors : [{ name: details.director, imageUrl: details.directorPhoto, bio: details.directorBio }]).map((person, index) => <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4" key={`${person.name}-${index}`}><Portrait color={color} name={person.name} url={person.imageUrl} /><div><p className="font-bold text-[var(--cream)]">{person.name}</p>{person.bio && <p className="mt-1 text-sm text-[var(--muted)]">{person.bio}</p>}</div></div>)}</div></section>}
          {cast.length > 0 && <section><h2 className="mb-4 flex items-center gap-2 font-orbitron text-xl font-bold text-[var(--cream)]"><FiUsers className="text-[var(--primary)]" /> Main Cast</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{cast.map((person, i) => <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 text-center" key={`${person.name}-${i}`}><div className="flex justify-center"><Portrait color={color} name={person.name} url={person.imageUrl} /></div><p className="mt-3 text-sm font-bold text-[var(--cream)]">{person.name}</p>{person.characterName && <p className="mt-1 text-xs text-[var(--muted)]">as {person.characterName}</p>}</div>)}</div></section>}
          {gallery.length > 0 && <section><h2 className="mb-4 font-orbitron text-xl font-bold text-[var(--cream)]">Gallery</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.map((url) => <a href={url} key={url} rel="noreferrer" target="_blank"><img alt={`${content.title} gallery`} className="aspect-video w-full rounded-xl object-cover" loading="lazy" src={url} /></a>)}</div></section>}
          {content.externalLinks?.length > 0 && <section><h2 className="mb-4 font-orbitron text-xl font-bold text-[var(--cream)]">Sources</h2><div className="flex flex-wrap gap-3">{content.externalLinks.map((link) => <a className="text-sm text-[var(--yellow)] underline" href={link.url} key={link.url} rel="noreferrer" target="_blank">{link.label || 'Source'}</a>)}</div></section>}
        </div>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6"><h2 className="mb-5 font-orbitron font-bold text-[var(--cream)]">Quick Info</h2><dl className="space-y-3 text-sm">{[['Country', details.country], ['Release', details.yearLabel || content.releaseYear], ['Runtime', runtime], ['Language', languages], ['Genre', details.genres?.join(', ')], ['Studio', details.studios?.join(', ')]].filter(([, value]) => value).map(([label, value]) => <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2" key={label}><dt className="text-[var(--muted)]">{label}</dt><dd className="text-right font-semibold text-[var(--cream)]">{value}</dd></div>)}</dl></section>
          {related.length > 0 && <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6"><h2 className="mb-5 font-orbitron font-bold text-[var(--cream)]">You Might Also Like</h2><div className="space-y-3">{related.map((item) => <Link className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-3 text-sm text-[var(--cream)] hover:border-[var(--primary)]" key={item._id} to={`/content/${item.slug || item._id}`}>{item.imageUrl ? <img alt="" className="h-16 w-12 rounded object-cover" src={item.imageUrl} /> : <FiFilm className="shrink-0" />}{item.title}</Link>)}</div></section>}
          <Link className="block rounded-full border border-[var(--border)] p-3 text-center text-sm text-[var(--cream)]" to="/explore/movies">Browse All Movies</Link>
        </aside>
      </div>
    </div>
  )
}
