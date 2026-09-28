import { getYouTubeEmbedUrl } from './youtube'

const PLACEHOLDER_IMAGE_HOSTS = new Set([
  'picsum.photos',
  'placehold.co',
  'via.placeholder.com',
  'dummyimage.com',
])

const PLACEHOLDER_YOUTUBE_IDS = new Set(['dQw4w9WgXcQ'])

export function getYouTubeId(value) {
  const embedUrl = getYouTubeEmbedUrl(value)
  const match = embedUrl.match(/\/embed\/([\w-]{11})/)
  return match?.[1] || ''
}

export function isPlaceholderImageUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return false

  try {
    const url = new URL(raw, 'http://localhost')
    return PLACEHOLDER_IMAGE_HOSTS.has(url.hostname.replace(/^www\./, '').toLowerCase())
  } catch {
    return false
  }
}

export function isPlaceholderVideoUrl(value) {
  const id = getYouTubeId(value)
  return Boolean(id && PLACEHOLDER_YOUTUBE_IDS.has(id))
}

export function isVerifiedImageUrl(value) {
  return Boolean(String(value || '').trim()) && !isPlaceholderImageUrl(value)
}

export function getVerifiedImageUrl(...values) {
  return values.flat().filter(Boolean).find(isVerifiedImageUrl) || ''
}

export function getPlayableMediaUrl(value) {
  const raw = String(value || '').trim()
  if (!raw || isPlaceholderVideoUrl(raw)) return ''
  return getYouTubeEmbedUrl(raw) || raw
}

export function isDirectVideoUrl(value) {
  return /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(String(value || ''))
}

export function isDirectAudioUrl(value) {
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(String(value || ''))
}

export function getMediaKind(item) {
  const type = String(item?.mediaType || '').toLowerCase()
  if (['image', 'photo', 'gallery'].includes(type)) return 'image'
  if (type === 'audio') return 'audio'
  if (['video', 'trailer', 'explainer'].includes(type)) return 'video'
  if (getPlayableMediaUrl(item?.embedUrl)) return 'video'
  if (getVerifiedImageUrl(item?.thumbnailUrl, item?.posterUrl, item?.bannerUrl, item?.galleryUrls)) return 'image'
  return type || 'media'
}

export function hasPreviewSource(item) {
  return Boolean(
    getPlayableMediaUrl(item?.embedUrl) ||
      getVerifiedImageUrl(item?.thumbnailUrl, item?.posterUrl, item?.bannerUrl, item?.galleryUrls),
  )
}
