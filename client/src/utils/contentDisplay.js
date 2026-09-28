import { getContentAssetOverride } from './fandomAssets'

export function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export function joinList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return value || ''
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
}

export function splitParagraphs(value) {
  return String(value || '')
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function imageFor(content) {
  const details = content?.details || {}
  const override = getContentAssetOverride(content)
  const overrideDetails = override?.details || {}
  return (
    content?.imageUrl ||
    override?.imageUrl ||
    details.heroImage ||
    details.bannerUrl ||
    overrideDetails.bannerUrl ||
    details.posterUrl ||
    overrideDetails.posterUrl ||
    details.coverUrl ||
    content?.imageUrls?.[0] ||
    override?.imageUrls?.[0] ||
    ''
  )
}

export function posterFor(content) {
  const details = content?.details || {}
  const override = getContentAssetOverride(content)
  const overrideDetails = override?.details || {}
  return (
    details.posterUrl ||
    overrideDetails.posterUrl ||
    details.coverUrl ||
    content?.imageUrl ||
    override?.imageUrl ||
    content?.imageUrls?.[0] ||
    override?.imageUrls?.[0] ||
    ''
  )
}

export function categoryLabel(content) {
  return content?.categoryInfo?.name || content?.category || content?.categorySlug || 'Fandom'
}
