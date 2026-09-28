import batmanImg from '../assets/character-batman.jfif'
import gokuImg from '../assets/character-goku.jfif'
import ironmanImg from '../assets/character-ironman.jfif'
import narutoImg from '../assets/character-naruto.jfif'
import spidermanImg from '../assets/character-spiderman.jfif'
import animeFallbackImg from '../assets/anime-card-1.jpg'
import charactersFallbackImg from '../assets/characters-hero.jpg'
import comicsFallbackImg from '../assets/comics-card-1.jpg'
import deadpoolImg from '../assets/deadpool.jpg'
import ellieImg from '../assets/ellie.jpg'
import gamingFallbackImg from '../assets/gaming-card-1.jpg'
import gojoImg from '../assets/gojo.jpg'
import kratosImg from '../assets/kratos.jpg'
import leviImg from '../assets/levi.jpg'
import luffyImg from '../assets/luffy.jpg'
import moviesFallbackImg from '../assets/movies-card-1.jpg'
import musicFallbackImg from '../assets/K-pop-card-1.jpg'

const PLACEHOLDER_IMAGE_RE = /^https?:\/\/(?:www\.)?picsum\.photos\//i

const normalizeName = (value = '') =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const LOCAL_CHARACTER_IMAGES = new Map(
  [
    ['Batman', batmanImg],
    ['Deadpool', deadpoolImg],
    ['Ellie Williams', ellieImg],
    ['Gojo Satoru', gojoImg],
    ['Goku', gokuImg],
    ['Son Goku', gokuImg],
    ['Iron Man', ironmanImg],
    ['Tony Stark', ironmanImg],
    ['Satoru Gojo', gojoImg],
    ['Kratos', kratosImg],
    ['Levi Ackerman', leviImg],
    ['Monkey D. Luffy', luffyImg],
    ['Naruto', narutoImg],
    ['Naruto Uzumaki', narutoImg],
    ['Spider-Man', spidermanImg],
    ['Spiderman', spidermanImg],
    ['Peter Parker', spidermanImg],
  ].map(([name, image]) => [normalizeName(name), image]),
)

function isRealImageUrl(src) {
  if (typeof src !== 'string') return false
  const trimmed = src.trim()
  return trimmed.length > 0 && !PLACEHOLDER_IMAGE_RE.test(trimmed)
}

function isUsableImageUrl(src) {
  return typeof src === 'string' && src.trim().length > 0
}

function fallbackForCharacter(character) {
  const label = normalizeName(
    [
      character?.categorySlug,
      character?.series,
      character?.fandom,
      character?.category,
      character?.title,
    ].join(' '),
  )

  if (label.includes('anime')) return animeFallbackImg
  if (label.includes('gaming') || label.includes('game')) return gamingFallbackImg
  if (label.includes('comic')) return comicsFallbackImg
  if (label.includes('movie')) return moviesFallbackImg
  if (label.includes('k pop') || label.includes('music') || label.includes('idol')) return musicFallbackImg
  return charactersFallbackImg
}

export function getCharacterImage(character) {
  const imageUrls = Array.isArray(character?.imageUrls) ? character.imageUrls : []
  const localImage = LOCAL_CHARACTER_IMAGES.get(normalizeName(character?.name))
  if (localImage) return localImage

  const directImages = [character?.imageUrl, character?.image, ...imageUrls]
  const directImage = directImages.find(isRealImageUrl)
  if (directImage) return directImage.trim()

  const fallbackImage = directImages.find(isUsableImageUrl)
  if (fallbackImage && !PLACEHOLDER_IMAGE_RE.test(fallbackImage.trim())) return fallbackImage.trim()
  return fallbackForCharacter(character)
}

export function hasCharacterImage(character) {
  return Boolean(getCharacterImage(character))
}
