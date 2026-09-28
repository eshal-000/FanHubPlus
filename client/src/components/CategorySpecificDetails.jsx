const SECTIONS = {
  anime: {
    title: 'Anime Guide',
    fields: [['Original title', 'originalTitle'], ['Creators', 'creators'], ['Studio', 'studios'], ['Release', 'yearLabel'], ['Country', 'country'], ['Language', 'languages']],
    lists: [['Main characters', 'characters'], ['Formats', 'formats']],
  },
  gaming: {
    title: 'Game Guide',
    fields: [['Developer', 'developer'], ['Publisher', 'publisher'], ['Release', 'yearLabel'], ['Platforms', 'platforms'], ['Genres', 'genres']],
    lists: [['Gameplay features', 'features']],
  },
  'tv-shows': {
    title: 'Show Guide',
    fields: [['Creators', 'creators'], ['Release', 'yearLabel'], ['Country', 'country'], ['Languages', 'languages'], ['Seasons', 'seasons'], ['Episodes', 'episodes']],
    lists: [['Main characters', 'characters']],
  },
  'k-pop': {
    title: 'Group Guide',
    fields: [['Debut', 'debutDate'], ['Agency', 'agency'], ['Origin', 'origin']],
    lists: [['Selected releases', 'selectedReleases']],
  },
  comics: {
    title: 'Comics Guide',
    fields: [['Creators', 'creators'], ['Publisher', 'publisher'], ['First published', 'yearLabel'], ['Country', 'country']],
    lists: [['Main characters', 'characters'], ['Notable publications', 'notablePublications']],
  },
  manga: {
    title: 'Manga Guide',
    fields: [['Japanese title', 'originalTitle'], ['Creator', 'creators'], ['Publisher', 'publisher'], ['Publication', 'yearLabel'], ['Volumes', 'volumes']],
    lists: [['Main characters', 'characters']],
  },
  cosplay: {
    title: 'Outfit Guide',
    fields: [['Outfit concept', 'outfitConcept']],
    lists: [['Clothing', 'clothing'], ['Accessories', 'accessories'], ['Materials', 'materials'], ['Styling ideas', 'stylingIdeas']],
  },
}

export default function CategorySpecificDetails({ content }) {
  const config = SECTIONS[content.categorySlug]
  if (!config) return null
  const details = content.details || {}
  const fields = config.fields.map(([label, key]) => [label, details[key]]).filter(([, value]) => Array.isArray(value) ? value.length : value !== undefined && value !== null && value !== '')
  const lists = config.lists.map(([label, key]) => [label, details[key]]).filter(([, value]) => Array.isArray(value) && value.length)
  const artwork = details.posterUrl || details.coverUrl || ''
  const media = details.trailerUrl || details.officialMediaUrl || ''

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-5">
      <h2 className="font-orbitron text-lg font-bold text-[var(--cream)]">{config.title}</h2>
      {artwork && <div className="mt-5 max-w-xs overflow-hidden rounded-xl border border-[var(--border)]"><img alt={`${content.title} official artwork`} className="w-full object-cover" src={artwork} /></div>}
      {fields.length > 0 && <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[var(--cream)]">{Array.isArray(value) ? value.join(', ') : value}</dd></div>)}</dl>}
      {lists.map(([label, items]) => <div className="mt-6" key={label}><h3 className="font-orbitron text-sm font-bold text-[var(--cream)]">{label}</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2">{items.map((item, index) => <li className="rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-3 text-sm text-[var(--muted)]" key={`${item}-${index}`}>{item}</li>)}</ul></div>)}
      {media && <a className="mt-6 inline-flex rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--cream)]" href={media} rel="noreferrer" target="_blank">Official media</a>}
      {!fields.length && !lists.length && !artwork && !media && <p className="mt-4 text-sm text-[var(--muted)]">Additional verified details have not been added yet.</p>}
    </section>
  )
}
