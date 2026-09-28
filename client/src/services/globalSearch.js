import { CATEGORIES } from '../data/categories'
import mariaApi from './mariaApi'
import { applyContentAssetOverrides } from '../utils/fandomAssets'
import { getCharacterImage } from '../utils/characterImages'
import { getVerifiedImageUrl } from '../utils/mediaAssets'

const MAX_RESULTS = 12
const PUBLIC_CATEGORY_KEY = 'phase2-initial'

function asArray(payload, key) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.[key])) return payload[key]
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.media)) return payload.media
  return []
}

function textOf(...values) {
  return values
    .flat()
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function matchesQuery(item, query, fields) {
  const haystack = textOf(fields.map((field) => item?.[field]))
  return haystack.includes(query)
}

function visualCategoryFor(category = {}) {
  const slug = category.slug || ''
  const name = String(category.name || '').toLowerCase()
  return CATEGORIES.find((item) => item.slug === slug || item.name.toLowerCase() === name) || {}
}

function makeResult({ description = '', image = '', meta = '', title, type, url }) {
  if (!title || !url) return null
  return {
    description: String(description || '').slice(0, 150),
    image,
    meta,
    title,
    type,
    url,
  }
}

function scoreResult(result, query) {
  const title = result.title.toLowerCase()
  if (title === query) return 0
  if (title.startsWith(query)) return 1
  if (title.includes(query)) return 2
  return 3
}

function uniqueResults(results) {
  const seen = new Set()
  return results.filter((result) => {
    const key = `${result.type}:${result.url}:${result.title}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function safeGet(url, config) {
  try {
    return (await mariaApi.get(url, config)).data
  } catch {
    return null
  }
}

export async function searchFanHubPlus(rawQuery) {
  const query = String(rawQuery || '').trim().toLowerCase()
  if (query.length < 2) return []

  const [
    categoriesPayload,
    contentsPayload,
    articlesPayload,
    charactersPayload,
    mediaPayload,
    eventsPayload,
    releasesPayload,
    merchPayload,
  ] = await Promise.all([
    safeGet('/categories', { params: { collectionKey: PUBLIC_CATEGORY_KEY } }),
    safeGet('/contents', { params: { limit: 20, search: query } }),
    safeGet('/articles', { params: { search: query } }),
    safeGet('/characters', { params: { search: query } }),
    safeGet('/media', { params: { limit: 80 } }),
    safeGet('/events', { params: { limit: 80 } }),
    safeGet('/releases', { params: { limit: 80 } }),
    safeGet('/merch', { params: { limit: 80, search: query } }),
  ])

  const categories = asArray(categoriesPayload, 'categories')
    .filter((category) => matchesQuery(category, query, ['name', 'description', 'slug']))
    .map((category) => {
      const visual = visualCategoryFor(category)
      return makeResult({
        title: category.name || visual.name,
        type: 'Category',
        meta: 'Explore',
        description: category.description || visual.description,
        image: category.image || category.heroImage || visual.image,
        url: `/explore/${category.slug || visual.slug}`,
      })
    })

  const contents = asArray(contentsPayload, 'contents').map(applyContentAssetOverrides).map((item) =>
    makeResult({
      title: item.title,
      type: item.type || 'Content',
      meta: item.categoryInfo?.name || item.category || item.categorySlug,
      description: item.description || item.details?.subtitle || item.details?.originalTitle,
      image: item.imageUrl || item.imageUrls?.[0] || item.details?.posterUrl || item.details?.bannerUrl,
      url: `/content/${item.slug || item._id}`,
    }),
  )

  const articles = asArray(articlesPayload, 'articles').map((item) =>
    makeResult({
      title: item.title,
      type: 'Article',
      meta: item.category || item.fandom || item.categorySlug,
      description: item.excerpt || item.body,
      image: item.imageUrl || item.imageUrls?.[0],
      url: `/articles/${item._id}`,
    }),
  )

  const characters = asArray(charactersPayload, 'characters').map((item) =>
    makeResult({
      title: item.name,
      type: 'Character',
      meta: item.series || item.fandom || item.category,
      description: item.bio || item.description,
      image: getCharacterImage(item),
      url: `/characters/${item._id}`,
    }),
  )

  const media = asArray(mediaPayload, 'data')
    .filter((item) => matchesQuery(item, query, ['title', 'fandom', 'category', 'mediaType', 'releaseYear']))
    .map((item) =>
      makeResult({
        title: item.title,
        type: 'Media',
        meta: item.mediaType || item.category,
        description: [item.fandom, item.category, item.releaseYear].filter(Boolean).join(' · '),
        image: getVerifiedImageUrl(item.thumbnailUrl, item.posterUrl, item.bannerUrl, item.galleryUrls),
        url: `/media/${item._id}`,
      }),
    )

  const events = asArray(eventsPayload, 'items')
    .filter((item) => matchesQuery(item, query, ['title', 'eventType', 'city', 'address', 'story']))
    .map((item) =>
      makeResult({
        title: item.title,
        type: 'Event',
        meta: [item.city, item.eventType].filter(Boolean).join(' · '),
        description: item.story || item.address,
        image: item.imageUrl,
        url: `/events/${item._id}`,
      }),
    )

  const releases = asArray(releasesPayload, 'items')
    .filter((item) => matchesQuery(item, query, ['title', 'releaseType', 'fandom', 'category', 'status']))
    .map((item) =>
      makeResult({
        title: item.title,
        type: 'Release',
        meta: [item.releaseType, item.status].filter(Boolean).join(' · '),
        description: [item.fandom, item.category].filter(Boolean).join(' · '),
        image: item.imageUrl,
        url: '/releases',
      }),
    )

  const merch = asArray(merchPayload, 'items').map((item) =>
    makeResult({
      title: item.name,
      type: 'Merch',
      meta: [item.fandom, item.category].filter(Boolean).join(' · '),
      description: item.description,
      image: Array.isArray(item.images) ? item.images[0] : item.imageUrl,
      url: `/merch/${item._id}`,
    }),
  )

  return uniqueResults([
    ...categories,
    ...contents,
    ...characters,
    ...articles,
    ...media,
    ...events,
    ...releases,
    ...merch,
  ].filter(Boolean))
    .sort((a, b) => scoreResult(a, query) - scoreResult(b, query))
    .slice(0, MAX_RESULTS)
}
