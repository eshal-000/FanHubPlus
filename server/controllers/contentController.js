const Content = require('../models/Content')
const Category = require('../models/Category')
const { categoryAliases, toCategorySlug } = require('../utils/category')
const { escapeRegex } = require('../utils/search')
const { searchCondition } = require('../utils/search')

function toContentSlug(value) {
  return String(value || 'content')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function normalizeOptionalList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return value
}

function getYouTubeEmbedUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let id = ''

    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || ''
      if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2] || ''
      if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2] || ''
    }

    if (!/^[\w-]{11}$/.test(id)) return ''
    return `https://www.youtube-nocookie.com/embed/${id}`
  } catch {
    return ''
  }
}

function validateYouTubeField(value, label) {
  if (!value) return
  if (!getYouTubeEmbedUrl(value)) {
    const error = new Error(`${label} must be a supported YouTube URL.`)
    error.statusCode = 400
    throw error
  }
}

function validateMediaPayload(next) {
  validateYouTubeField(next.videoUrl, 'Video URL')

  const details = next.details || {}
  validateYouTubeField(details.trailerUrl, 'Trailer URL')

  if (details.featuredMedia?.type === 'youtube') {
    validateYouTubeField(details.featuredMedia.url, 'Featured media URL')
  }
  validateYouTubeField(details.featuredSong?.youtubeUrl, 'Featured song YouTube URL')
}

async function attachCategoryInfo(contents) {
  const items = Array.isArray(contents) ? contents : [contents]
  const slugs = [...new Set(items.map((item) => item?.categorySlug).filter(Boolean))]
  const categories = slugs.length
    ? await Category.find({ slug: { $in: slugs } }).lean()
    : []
  const categoryMap = new Map(categories.map((category) => [category.slug, category]))

  const normalized = items.map((content) => normalizeContent(content, categoryMap.get(content.categorySlug)))
  return Array.isArray(contents) ? normalized : normalized[0]
}

function normalizeContent(content, categoryInfo = null) {
  return {
    ...content,
    categorySlug: content.categorySlug || toCategorySlug(content.fandom || content.category),
    categoryInfo,
    status: content.status || 'published',
  }
}

function prepareContentPayload(body = {}, existing = null) {
  const next = { ...body }
  const categorySlug = body.categorySlug || toCategorySlug(body.fandom || body.category)
  if (categorySlug) next.categorySlug = categorySlug
  if (!next.category && next.categorySlug) {
    next.category = categoryAliases(next.categorySlug).find((item) => item !== next.categorySlug) || next.categorySlug
  }
  if (!next.fandom && next.category) next.fandom = next.category
  if (next.title && (!next.slug || next.slug === existing?.slug)) {
    next.slug = existing?.slug || toContentSlug(next.title)
  } else if (next.slug) {
    next.slug = toContentSlug(next.slug)
  }
  if (next.status === 'published' && !next.publishedAt && !existing?.publishedAt) {
    next.publishedAt = new Date()
  }
  if (next.status === 'draft') {
    next.publishedAt = existing?.publishedAt || next.publishedAt || null
  }
  if (Array.isArray(next.relatedContent)) {
    next.relatedContent = next.relatedContent.filter((id) => id && /^[0-9a-fA-F]{24}$/.test(String(id)))
  }
  if (next.details && typeof next.details === 'object') {
    const listKeys = [
      'accessories',
      'alternateTitles',
      'characters',
      'clothing',
      'creators',
      'features',
      'formats',
      'genres',
      'languages',
      'materials',
      'notablePublications',
      'platforms',
      'selectedReleases',
      'studios',
      'stylingIdeas',
    ]
    for (const key of listKeys) {
      if (next.details[key] !== undefined) next.details[key] = normalizeOptionalList(next.details[key])
    }
    if (Array.isArray(next.details.descriptionPanels)) {
      next.details.descriptionPanels = next.details.descriptionPanels
        .map((panel) => ({
          body: String(panel?.body || '').trim(),
          items: normalizeOptionalList(panel?.items) || [],
          title: String(panel?.title || '').trim(),
        }))
        .filter((panel) => panel.title || panel.body || asArray(panel.items).length)
    }
    if (Array.isArray(next.details.animeVoices)) {
      next.details.animeVoices = next.details.animeVoices
        .map((voice) => ({
          audioUrl: String(voice?.audioUrl || '').trim(),
          characterName: String(voice?.characterName || '').trim(),
          imageUrl: String(voice?.imageUrl || '').trim(),
          notes: String(voice?.notes || '').trim(),
          rightsStatus: ['unknown', 'needs-review', 'cleared', 'restricted'].includes(voice?.rightsStatus)
            ? voice.rightsStatus
            : 'unknown',
          seriesName: String(voice?.seriesName || '').trim(),
          sourceFile: String(voice?.sourceFile || '').trim(),
        }))
        .filter((voice) => voice.characterName || voice.audioUrl)
    }
  }
  validateMediaPayload(next)
  return next
}

exports.getContents = async (req, res, next) => {
  try {
    const { category, collectionKey, limit, search, sort, type } = req.query
    const clauses = [{ $or: [{ status: 'published' }, { status: { $exists: false } }] }]

    if (category) {
      clauses.push({
        $or: [
          { categorySlug: category },
          { categorySlug: toCategorySlug(category) },
          { category: { $in: categoryAliases(category) } },
          { fandom: { $in: categoryAliases(category) } },
        ],
      })
    }
    if (collectionKey) clauses.push({ collectionKey: String(collectionKey).trim() })
    if (type) clauses.push({ type })
    const searchQuery = searchCondition(search, [
      'title',
      'description',
      'body',
      'tags',
      'details.alternateTitles',
      'details.originalTitle',
      'details.subtitle',
    ])
    if (searchQuery) clauses.push(searchQuery)

    const query = clauses.length === 1 ? clauses[0] : { $and: clauses }

    let sortSpec = { popularity: -1, createdAt: -1 }
    if (sort === 'latest') sortSpec = { createdAt: -1 }
    if (sort === 'az') sortSpec = { title: 1 }

    let contentQuery = Content.find(query)
      .sort(sortSpec)
      .populate({ path: 'relatedContent', match: { status: 'published' }, select: 'title slug categorySlug imageUrl type status' })

    const parsedLimit = Number.parseInt(limit, 10)
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      contentQuery = contentQuery.limit(Math.min(parsedLimit, 100))
    }

    const contents = await attachCategoryInfo(await contentQuery.lean())
    res.json({ contents, count: contents.length })
  } catch (err) {
    next(err)
  }
}

exports.getContentByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params
    const byId = identifier.match(/^[0-9a-fA-F]{24}$/)
    const query = byId
      ? { _id: identifier }
      : { slug: new RegExp(`^${escapeRegex(identifier)}$`, 'i') }

    const content = await Content.findOne({
      ...query,
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    })
      .populate({ path: 'relatedContent', match: { status: 'published' }, select: 'title slug categorySlug imageUrl description type status rating releaseYear' })
      .lean()
    if (!content) return res.status(404).json({ message: 'Content not found' })
    return res.json({ content: await attachCategoryInfo(content) })
  } catch (err) {
    next(err)
  }
}

exports.createContent = async (req, res, next) => {
  try {
    const content = await Content.create(prepareContentPayload(req.body))
    res.status(201).json({ message: 'Content created', content })
  } catch (err) {
    next(err)
  }
}

exports.updateContent = async (req, res, next) => {
  try {
    const existing = await Content.findById(req.params.id).lean()
    if (!existing) return res.status(404).json({ message: 'Content not found' })

    const content = await Content.findByIdAndUpdate(req.params.id, prepareContentPayload(req.body, existing), {
      new: true,
      runValidators: true,
    })
    return res.json({ message: 'Content updated', content })
  } catch (err) {
    next(err)
  }
}

exports.deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id)
    if (!content) return res.status(404).json({ message: 'Content not found' })
    return res.json({ message: 'Content deleted' })
  } catch (err) {
    next(err)
  }
}

exports.prepareContentPayload = prepareContentPayload
