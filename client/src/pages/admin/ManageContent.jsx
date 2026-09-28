import { useEffect, useMemo, useState } from 'react'
import { FiEdit, FiGrid, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi'
import AdminShell from '../../components/admin/AdminShell'
import mariaApi from '../../services/mariaApi'
import { isSupportedYouTubeUrl } from '../../utils/youtube'

const CONTENT_TYPES = [
  'article',
  'video',
  'audio',
  'image',
  'gallery',
  'review',
  'news',
  'anime',
  'game',
  'movie',
  'tv-show',
  'k-pop',
  'comic',
  'manga',
  'cosplay',
]

const DETAIL_FIELDS = {
  anime: [['Original title', 'originalTitle'], ['Creators', 'creators', 'list'], ['Studio', 'studios', 'list'], ['Release', 'yearLabel'], ['Country', 'country'], ['Languages', 'languages', 'list'], ['Main characters', 'characters', 'list'], ['Official artwork URL', 'posterUrl']],
  gaming: [['Developer', 'developer'], ['Publisher', 'publisher'], ['Release', 'yearLabel'], ['Platforms', 'platforms', 'list'], ['Genres', 'genres', 'list'], ['Gameplay features', 'features', 'list'], ['Official artwork URL', 'coverUrl']],
  movies: [['Original title', 'originalTitle'], ['Director', 'director'], ['Director photo URL', 'directorPhoto'], ['Release', 'yearLabel'], ['Runtime (minutes)', 'runtimeMinutes', 'number'], ['Country', 'country'], ['Languages', 'languages', 'list'], ['Genres', 'genres', 'list'], ['Official poster URL', 'posterUrl'], ['Official trailer URL', 'trailerUrl']],
  'tv-shows': [['Creators', 'creators', 'list'], ['Release', 'yearLabel'], ['Country', 'country'], ['Languages', 'languages', 'list'], ['Seasons', 'seasons', 'number'], ['Episodes', 'episodes', 'number'], ['Main characters', 'characters', 'list'], ['Official poster URL', 'posterUrl'], ['Official trailer URL', 'trailerUrl']],
  'k-pop': [['Debut', 'debutDate'], ['Agency', 'agency'], ['Origin', 'origin'], ['Selected releases', 'selectedReleases', 'list'], ['Official group photo URL', 'posterUrl']],
  comics: [['Creators', 'creators', 'list'], ['Publisher', 'publisher'], ['Publication', 'yearLabel'], ['Main characters', 'characters', 'list'], ['Notable publications', 'notablePublications', 'list'], ['Official artwork URL', 'coverUrl']],
  manga: [['Japanese title', 'originalTitle'], ['Creator', 'creators', 'list'], ['Publisher', 'publisher'], ['Publication', 'yearLabel'], ['Volumes', 'volumes', 'number'], ['Main characters', 'characters', 'list'], ['Official cover URL', 'coverUrl']],
  cosplay: [['Outfit concept', 'outfitConcept'], ['Clothing', 'clothing', 'list'], ['Accessories', 'accessories', 'list'], ['Materials', 'materials', 'list'], ['Styling ideas', 'stylingIdeas', 'list'], ['Modest inspiration image URL', 'posterUrl']],
}

const DETAIL_FALLBACKS = {
  comic: 'comics',
  game: 'gaming',
  movie: 'movies',
  'tv-show': 'tv-shows',
}

function emptyForm(categorySlug = '') {
  return {
    body: '',
    categorySlug,
    collectionKey: 'phase2-initial',
    contributors: '[]',
    description: '',
    details: '{}',
    externalLinks: '[]',
    imageUrl: '',
    imageUrls: '',
    popularity: '',
    rating: '',
    relatedContent: '',
    releaseYear: '',
    status: 'published',
    tags: '',
    title: '',
    type: 'article',
    videoUrl: '',
  }
}

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseJsonField(value, fallback, label) {
  try {
    const parsed = JSON.parse(value || JSON.stringify(fallback))
    return parsed
  } catch {
    throw new Error(`${label} must be valid JSON.`)
  }
}

function stringifyJson(value, fallback) {
  return JSON.stringify(value || fallback, null, 2)
}

function itemToForm(item, defaultCategorySlug) {
  return {
    body: item.body || '',
    categorySlug: item.categorySlug || defaultCategorySlug,
    collectionKey: item.collectionKey || '',
    contributors: stringifyJson(item.contributors, []),
    description: item.description || '',
    details: stringifyJson(item.details, {}),
    externalLinks: stringifyJson(item.externalLinks, []),
    imageUrl: item.imageUrl || '',
    imageUrls: (item.imageUrls || []).join('\n'),
    popularity: item.popularity ?? '',
    rating: item.rating ?? '',
    relatedContent: (item.relatedContent || [])
      .map((entry) => (typeof entry === 'string' ? entry : entry?._id))
      .filter(Boolean)
      .join('\n'),
    releaseYear: item.releaseYear ?? '',
    status: item.status || 'published',
    tags: (item.tags || []).join(', '),
    title: item.title || '',
    type: item.type || 'article',
    videoUrl: item.videoUrl || '',
  }
}

const ManageContent = () => {
  const [categories, setCategories] = useState([])
  const [contents, setContents] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [relatedSearch, setRelatedSearch] = useState('')
  const [listDrafts, setListDrafts] = useState({})

  const defaultCategorySlug = categories[0]?.slug || ''

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  )

  const fetchCategories = async () => {
    const { data } = await mariaApi.get('/categories')
    setCategories(data.categories || [])
    if (!form.categorySlug && data.categories?.[0]?.slug) {
      setForm((current) => ({ ...current, categorySlug: data.categories[0].slug }))
    }
  }

  const fetchContents = async () => {
    const { data } = await mariaApi.get('/admin/contents', { params: { limit: 200 } })
    setContents(data.items || [])
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchCategories(), fetchContents()])
    } catch (err) {
      console.error(err)
      window.alert(err?.response?.data?.message || err.message || 'Failed to load content manager data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()

  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm(defaultCategorySlug))
    setRelatedSearch('')
    setListDrafts({})
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm(itemToForm(item, defaultCategorySlug))
    setRelatedSearch('')
    setListDrafts({})
    setShowModal(true)
  }

  const buildPayload = () => {
    const details = parseJsonField(form.details, {}, 'Details')
    const contributorsRaw = parseJsonField(form.contributors, [], 'Contributors')
    const externalLinksRaw = parseJsonField(form.externalLinks, [], 'External links')

    if (!Array.isArray(contributorsRaw)) throw new Error('Contributors must be a JSON array.')
    if (!Array.isArray(externalLinksRaw)) throw new Error('External links must be a JSON array.')
    if (!details || Array.isArray(details) || typeof details !== 'object') throw new Error('Details must be a JSON object.')

    const contributors = contributorsRaw
      .map((person) => ({
        bio: String(person?.bio || '').trim(),
        characterName: String(person?.characterName || '').trim(),
        imageUrl: String(person?.imageUrl || '').trim(),
        name: String(person?.name || '').trim(),
        role: String(person?.role || '').trim(),
      }))
      .filter((person) => person.name || person.role || person.characterName || person.imageUrl || person.bio)

    const externalLinks = externalLinksRaw
      .map((link) => ({
        label: String(link?.label || '').trim(),
        type: String(link?.type || 'reference').trim() || 'reference',
        url: String(link?.url || '').trim(),
      }))
      .filter((link) => link.label || link.url)

    for (const [key, value] of Object.entries(listDrafts)) {
      const rows = splitLines(value)
      if (rows.length) details[key] = rows
      else delete details[key]
    }

    if (!isSupportedYouTubeUrl(form.videoUrl)) throw new Error('Video or trailer URL must be a supported YouTube URL.')
    if (!isSupportedYouTubeUrl(details.trailerUrl)) throw new Error('Official trailer URL must be a supported YouTube URL.')
    if (details.featuredMedia?.type === 'youtube' && !isSupportedYouTubeUrl(details.featuredMedia?.url)) {
      throw new Error('Featured media URL must be a supported YouTube URL when media type is YouTube.')
    }
    if (!isSupportedYouTubeUrl(details.featuredSong?.youtubeUrl)) {
      throw new Error('Featured song URL must be a supported YouTube URL.')
    }

    const payload = {
      body: form.body,
      categorySlug: form.categorySlug,
      collectionKey: form.collectionKey,
      contributors,
      description: form.description,
      details,
      externalLinks,
      imageUrl: form.imageUrl,
      imageUrls: splitLines(form.imageUrls),
      relatedContent: splitLines(form.relatedContent),
      status: form.status,
      tags: splitLines(form.tags),
      title: form.title,
      type: form.type,
      videoUrl: form.videoUrl,
    }

    if (form.rating !== '') payload.rating = Number(form.rating)
    if (form.releaseYear !== '') payload.releaseYear = Number(form.releaseYear)
    if (form.popularity !== '') payload.popularity = Number(form.popularity)

    return payload
  }

  const readDetails = () => {
    try { return JSON.parse(form.details || '{}') || {} } catch { return {} }
  }

  const updateDetail = (key, value) => {
    const details = readDetails()
    if (value === '' || (Array.isArray(value) && !value.length)) delete details[key]
    else details[key] = value
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const readContributors = () => {
    try { const rows = JSON.parse(form.contributors || '[]'); return Array.isArray(rows) ? rows : [] } catch { return [] }
  }

  const updateContributors = (rows) => setForm((current) => ({ ...current, contributors: stringifyJson(rows, []) }))

  const readExternalLinks = () => {
    try { const rows = JSON.parse(form.externalLinks || '[]'); return Array.isArray(rows) ? rows : [] } catch { return [] }
  }

  const updateExternalLinks = (rows) => setForm((current) => ({ ...current, externalLinks: stringifyJson(rows, []) }))

  const updateNestedDetail = (section, key, value) => {
    const details = readDetails()
    const current = details[section] && typeof details[section] === 'object' && !Array.isArray(details[section])
      ? details[section]
      : {}
    const nextSection = { ...current }
    if (value === '' || value === undefined || value === null) delete nextSection[key]
    else nextSection[key] = value
    if (Object.values(nextSection).every((item) => item === '' || item === undefined || item === null)) {
      delete details[section]
    } else {
      details[section] = nextSection
    }
    setForm((currentForm) => ({ ...currentForm, details: stringifyJson(details, {}) }))
  }

  const readDescriptionPanels = () => {
    const rows = readDetails().descriptionPanels
    return Array.isArray(rows) ? rows : []
  }

  const updateDescriptionPanel = (index, key, value) => {
    const details = readDetails()
    const rows = readDescriptionPanels()
    rows[index] = { ...(rows[index] || {}), [key]: value }
    details.descriptionPanels = rows
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const addDescriptionPanel = () => {
    const details = readDetails()
    details.descriptionPanels = [...readDescriptionPanels(), { title: '', body: '', items: [] }]
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const removeDescriptionPanel = (index) => {
    const details = readDetails()
    details.descriptionPanels = readDescriptionPanels().filter((_, rowIndex) => rowIndex !== index)
    if (!details.descriptionPanels.length) delete details.descriptionPanels
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const readAnimeVoices = () => {
    const rows = readDetails().animeVoices
    return Array.isArray(rows) ? rows : []
  }

  const updateAnimeVoice = (index, key, value) => {
    const details = readDetails()
    const rows = readAnimeVoices()
    rows[index] = { ...(rows[index] || { rightsStatus: 'needs-review' }), [key]: value }
    details.animeVoices = rows
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const addAnimeVoice = () => {
    const details = readDetails()
    details.animeVoices = [
      ...readAnimeVoices(),
      { audioUrl: '', characterName: '', imageUrl: '', notes: '', rightsStatus: 'needs-review', seriesName: '', sourceFile: '' },
    ]
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const removeAnimeVoice = (index) => {
    const details = readDetails()
    details.animeVoices = readAnimeVoices().filter((_, rowIndex) => rowIndex !== index)
    if (!details.animeVoices.length) delete details.animeVoices
    setForm((current) => ({ ...current, details: stringifyJson(details, {}) }))
  }

  const toggleRelated = (id) => {
    const selected = splitLines(form.relatedContent)
    setForm((current) => ({ ...current, relatedContent: (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]).join('\n') }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = buildPayload()
      if (editing) {
        await mariaApi.put(`/admin/contents/${editing._id}`, payload)
      } else {
        await mariaApi.post('/admin/contents', payload)
      }
      setShowModal(false)
      setEditing(null)
      setForm(emptyForm(defaultCategorySlug))
      await fetchContents()
    } catch (err) {
      console.error(err)
      window.alert(err?.response?.data?.message || err.message || 'Failed to save content.')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (item, status) => {
    try {
      await mariaApi.patch(`/admin/contents/${item._id}`, { ...item, status })
      await fetchContents()
    } catch (err) {
      console.error(err)
      window.alert(err?.response?.data?.message || err.message || 'Failed to update status.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content record?')) return
    try {
      await mariaApi.delete(`/admin/contents/${id}`)
      await fetchContents()
    } catch (err) {
      console.error(err)
      window.alert(err?.response?.data?.message || err.message || 'Failed to delete content.')
    }
  }

  const filtered = contents.filter((content) => {
    const q = searchQuery.toLowerCase()
    return (
      content.title?.toLowerCase().includes(q) ||
      content.categorySlug?.toLowerCase().includes(q) ||
      content.type?.toLowerCase().includes(q)
    )
  })
  const activeDetailKey = DETAIL_FIELDS[form.categorySlug] ? form.categorySlug : DETAIL_FALLBACKS[form.type] || form.type
  const activeDetailFields = DETAIL_FIELDS[activeDetailKey] || []

  return (
    <AdminShell title="Manage Content" subtitle="Maria's content library, categories and published status.">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiGrid className="text-[var(--primary)]" />
            <h1 className="font-orbitron text-2xl font-bold text-[var(--cream)] md:text-3xl">
              Manage Content
            </h1>
          </div>
          <button
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)]"
            onClick={openCreate}
          >
            <FiPlus size={14} /> Add Content
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="w-full rounded-full border border-[var(--border)] bg-[var(--nav)] py-2.5 pl-11 pr-4 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content..."
            type="search"
            value={searchQuery}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
          <table className="w-full">
            <thead className="border-b border-[var(--border)] bg-[var(--nav)]/60">
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-[var(--muted)]">Title</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-[var(--muted)]">Category</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-[var(--muted)]">Type</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-[var(--muted)]">Status</th>
                <th className="p-4 text-right text-xs uppercase tracking-wider text-[var(--muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-8 text-center text-[var(--muted)]" colSpan="5">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="p-8 text-center text-[var(--muted)]" colSpan="5">No content found</td></tr>
              ) : filtered.map((item) => {
                const category = categoryMap.get(item.categorySlug)
                const isPublished = item.status === 'published'
                return (
                  <tr className="border-b border-[var(--border)] last:border-0" key={item._id}>
                    <td className="p-4 text-sm text-[var(--cream)]">
                      <div className="font-semibold">{item.title}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{item.slug}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold"
                        style={{
                          backgroundColor: `${category?.color || '#666'}20`,
                          color: category?.color || '#999',
                        }}
                      >
                        {category?.name || item.categorySlug}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--muted)]">{item.type}</td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${isPublished ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        className="mr-1 rounded-lg px-3 py-2 text-xs text-[var(--yellow)] transition hover:bg-[var(--yellow)]/10"
                        onClick={() => updateStatus(item, isPublished ? 'draft' : 'published')}
                      >
                        {isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        className="mr-1 rounded-lg p-2 text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
                        onClick={() => openEdit(item)}
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-orbitron text-xl text-[var(--cream)]">
                {editing ? 'Edit Content' : 'Add Content'}
              </h2>
              <button className="text-[var(--muted)]" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Title"
                  required
                  value={form.title}
                />
                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  value={form.type}
                >
                  {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <label className="grid gap-1 text-xs text-[var(--muted)]">Collection key
                <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)]" onChange={(e) => setForm({ ...form, collectionKey: e.target.value })} placeholder="phase2-initial" value={form.collectionKey} />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  disabled={categories.length === 0}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                  required
                  value={form.categorySlug}
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  value={form.status}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <textarea
                className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Card description"
                rows="3"
                value={form.description}
              />
              <textarea
                className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Full detail body"
                rows="5"
                value={form.body}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="Primary image URL"
                  value={form.imageUrl}
                />
                <input
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="Video or trailer URL"
                  value={form.videoUrl}
                />
              </div>

              <textarea
                className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
                placeholder="Gallery image URLs, one per line"
                rows="3"
                value={form.imageUrls}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  max="5"
                  min="0"
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="Rating"
                  step="0.1"
                  type="number"
                  value={form.rating}
                />
                <input
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
                  placeholder="Release year"
                  type="number"
                  value={form.releaseYear}
                />
                <input
                  className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                  onChange={(e) => setForm({ ...form, popularity: e.target.value })}
                  placeholder="Popularity"
                  type="number"
                  value={form.popularity}
                />
              </div>

              <input
                className="rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none"
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Tags, comma-separated"
                value={form.tags}
              />

              <fieldset className="grid gap-3 rounded-xl border border-[var(--border)] p-4 md:grid-cols-2">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">Premium media</legend>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Hero image URL
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateDetail('heroImage', event.target.value)} placeholder="Large hero/detail image" value={readDetails().heroImage || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Banner image URL
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateDetail('bannerUrl', event.target.value)} placeholder="Optional wide banner image" value={readDetails().bannerUrl || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Featured media type
                  <select className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredMedia', 'type', event.target.value)} value={readDetails().featuredMedia?.type || 'image'}>
                    <option value="image">Image</option>
                    <option value="youtube">YouTube</option>
                    <option value="audio">Audio</option>
                    <option value="external">External</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Featured media URL
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredMedia', 'url', event.target.value)} placeholder="YouTube URL or verified media URL" value={readDetails().featuredMedia?.url || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Featured media title
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredMedia', 'title', event.target.value)} placeholder="Official trailer, gameplay clip, cover reveal..." value={readDetails().featuredMedia?.title || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Featured media thumbnail URL
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredMedia', 'thumbnailUrl', event.target.value)} placeholder="Optional thumbnail" value={readDetails().featuredMedia?.thumbnailUrl || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)] md:col-span-2">Featured media description
                  <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredMedia', 'description', event.target.value)} placeholder="What this media represents" rows="2" value={readDetails().featuredMedia?.description || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Featured song title
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredSong', 'title', event.target.value)} placeholder="K-pop track or official performance" value={readDetails().featuredSong?.title || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)]">Featured song YouTube URL
                  <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredSong', 'youtubeUrl', event.target.value)} placeholder="Supported YouTube URL" value={readDetails().featuredSong?.youtubeUrl || ''} />
                </label>
                <label className="grid gap-1 text-xs text-[var(--muted)] md:col-span-2">Featured song description
                  <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateNestedDetail('featuredSong', 'description', event.target.value)} placeholder="Context for the selected song/video" rows="2" value={readDetails().featuredSong?.description || ''} />
                </label>
              </fieldset>

              {activeDetailFields.length > 0 && <fieldset className="grid gap-3 rounded-xl border border-[var(--border)] p-4 md:grid-cols-2">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">{categoryMap.get(form.categorySlug)?.name || activeDetailKey} details</legend>
                {activeDetailFields.map(([label, key, kind]) => {
                  const value = readDetails()[key]
                  return <label className="grid gap-1 text-xs text-[var(--muted)]" key={key}>{label}
                    {kind === 'list' ? <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => { setListDrafts((current) => ({ ...current, [key]: event.target.value })); updateDetail(key, splitLines(event.target.value)) }} placeholder="One per line" rows="2" value={listDrafts[key] ?? (Array.isArray(value) ? value.join('\n') : '')} /> : <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" min={kind === 'number' ? 0 : undefined} onChange={(event) => updateDetail(key, kind === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value)} type={kind === 'number' ? 'number' : 'text'} value={value ?? ''} />}
                  </label>
                })}
              </fieldset>}

              <fieldset className="rounded-xl border border-[var(--border)] p-4">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">Description panels</legend>
                {readDescriptionPanels().map((panel, index) => (
                  <div className="mb-3 grid gap-2 rounded-lg border border-[var(--border)] p-3" key={index}>
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateDescriptionPanel(index, 'title', event.target.value)} placeholder="Panel title" value={panel.title || ''} />
                    <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateDescriptionPanel(index, 'body', event.target.value)} placeholder="Panel body" rows="3" value={panel.body || ''} />
                    <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateDescriptionPanel(index, 'items', splitLines(event.target.value))} placeholder="Optional bullet items, one per line" rows="2" value={Array.isArray(panel.items) ? panel.items.join('\n') : ''} />
                    <button className="text-left text-xs text-red-300" onClick={() => removeDescriptionPanel(index)} type="button">Remove panel</button>
                  </div>
                ))}
                <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--cream)]" onClick={addDescriptionPanel} type="button">Add description panel</button>
              </fieldset>

              {activeDetailKey === 'anime' && <fieldset className="rounded-xl border border-[var(--border)] p-4">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">Iconic Anime Voices</legend>
                {readAnimeVoices().map((voice, index) => (
                  <div className="mb-3 grid gap-2 rounded-lg border border-[var(--border)] p-3 md:grid-cols-2" key={index}>
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateAnimeVoice(index, 'characterName', event.target.value)} placeholder="Character name" value={voice.characterName || ''} />
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateAnimeVoice(index, 'seriesName', event.target.value)} placeholder="Series name" value={voice.seriesName || ''} />
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateAnimeVoice(index, 'audioUrl', event.target.value)} placeholder="/audios/anime-voices/file.mp3" value={voice.audioUrl || ''} />
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateAnimeVoice(index, 'imageUrl', event.target.value)} placeholder="Optional character image URL" value={voice.imageUrl || ''} />
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateAnimeVoice(index, 'sourceFile', event.target.value)} placeholder="Original source filename" value={voice.sourceFile || ''} />
                    <select className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateAnimeVoice(index, 'rightsStatus', event.target.value)} value={voice.rightsStatus || 'needs-review'}>
                      <option value="needs-review">Needs rights review</option>
                      <option value="unknown">Unknown</option>
                      <option value="cleared">Cleared</option>
                      <option value="restricted">Restricted</option>
                    </select>
                    <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)] md:col-span-2" onChange={(event) => updateAnimeVoice(index, 'notes', event.target.value)} placeholder="Notes or review flags" rows="2" value={voice.notes || ''} />
                    <button className="text-left text-xs text-red-300" onClick={() => removeAnimeVoice(index)} type="button">Remove voice</button>
                  </div>
                ))}
                <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--cream)]" onClick={addAnimeVoice} type="button">Add voice clip</button>
              </fieldset>}

              <fieldset className="rounded-xl border border-[var(--border)] p-4">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">People: director, cast, voice actors, members and creators</legend>
                {readContributors().map((person, index) => <div className="mb-3 grid gap-2 rounded-lg border border-[var(--border)] p-3 md:grid-cols-2" key={index}>
                  {['name', 'role', 'characterName', 'imageUrl'].map((field) => <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" key={field} onChange={(event) => updateContributors(readContributors().map((row, rowIndex) => rowIndex === index ? { ...row, [field]: event.target.value } : row))} placeholder={{ name: 'Person name', role: 'Role (e.g. Actor, Member)', characterName: 'Character name (if applicable)', imageUrl: 'Photo URL' }[field]} value={person[field] || ''} />)}
                  <textarea className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)] md:col-span-2" onChange={(event) => updateContributors(readContributors().map((row, rowIndex) => rowIndex === index ? { ...row, bio: event.target.value } : row))} placeholder="Short bio or verified role notes" rows="2" value={person.bio || ''} />
                  <button className="text-left text-xs text-red-300" onClick={() => updateContributors(readContributors().filter((_, rowIndex) => rowIndex !== index))} type="button">Remove person</button>
                </div>)}
                <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--cream)]" onClick={() => updateContributors([...readContributors(), { bio: '', characterName: '', imageUrl: '', name: '', role: '' }])} type="button">Add person</button>
              </fieldset>

              <fieldset className="rounded-xl border border-[var(--border)] p-4">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">External references</legend>
                {readExternalLinks().map((link, index) => (
                  <div className="mb-3 grid gap-2 rounded-lg border border-[var(--border)] p-3 md:grid-cols-3" key={index}>
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateExternalLinks(readExternalLinks().map((row, rowIndex) => rowIndex === index ? { ...row, label: event.target.value } : row))} placeholder="Label" value={link.label || ''} />
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateExternalLinks(readExternalLinks().map((row, rowIndex) => rowIndex === index ? { ...row, type: event.target.value } : row))} placeholder="Type" value={link.type || 'reference'} />
                    <input className="rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => updateExternalLinks(readExternalLinks().map((row, rowIndex) => rowIndex === index ? { ...row, url: event.target.value } : row))} placeholder="Verified URL" value={link.url || ''} />
                    <button className="text-left text-xs text-red-300" onClick={() => updateExternalLinks(readExternalLinks().filter((_, rowIndex) => rowIndex !== index))} type="button">Remove reference</button>
                  </div>
                ))}
                <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--cream)]" onClick={() => updateExternalLinks([...readExternalLinks(), { label: '', type: 'reference', url: '' }])} type="button">Add reference</button>
              </fieldset>

              <textarea
                className="font-mono rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-xs text-[var(--cream)] outline-none"
                onChange={(e) => { setListDrafts({}); setForm({ ...form, details: e.target.value }) }}
                placeholder="Advanced structured details JSON"
                rows="8"
                value={form.details}
              />
              <textarea
                className="font-mono rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-xs text-[var(--cream)] outline-none"
                onChange={(e) => setForm({ ...form, contributors: e.target.value })}
                placeholder="Advanced contributors JSON array"
                rows="6"
                value={form.contributors}
              />
              <textarea
                className="font-mono rounded-lg border border-[var(--border)] bg-[var(--nav)] px-4 py-2.5 text-xs text-[var(--cream)] outline-none"
                onChange={(e) => setForm({ ...form, externalLinks: e.target.value })}
                placeholder="External source links JSON array"
                rows="5"
                value={form.externalLinks}
              />
              <fieldset className="rounded-xl border border-[var(--border)] p-4">
                <legend className="px-2 font-orbitron text-sm text-[var(--cream)]">Related content</legend>
                <input className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--nav)] p-2 text-sm text-[var(--cream)]" onChange={(event) => setRelatedSearch(event.target.value)} placeholder="Search existing content" type="search" value={relatedSearch} />
                <div className="max-h-44 space-y-1 overflow-y-auto">{contents.filter((item) => item._id !== editing?._id && `${item.title} ${item.categorySlug}`.toLowerCase().includes(relatedSearch.toLowerCase())).map((item) => <label className="flex items-center gap-2 rounded-lg p-2 text-sm text-[var(--cream)] hover:bg-[var(--nav)]" key={item._id}><input checked={splitLines(form.relatedContent).includes(item._id)} onChange={() => toggleRelated(item._id)} type="checkbox" />{item.title} <span className="text-xs text-[var(--muted)]">({item.categorySlug})</span></label>)}</div>
                {contents.length === 0 && <p className="text-xs text-[var(--muted)]">Create content before linking related records.</p>}
              </fieldset>

              <button
                className="rounded-full bg-[var(--primary)] py-3 font-semibold text-[var(--cream)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default ManageContent
