const CATEGORIES_BASE = '/images/categories/'

export const CATEGORY_PUBLIC_IMAGES = {
  anime: `${CATEGORIES_BASE}category-anime.png`,
  gaming: `${CATEGORIES_BASE}category-gaming.png`,
  movies: `${CATEGORIES_BASE}category-movies.png`,
  'tv-shows': `${CATEGORIES_BASE}category-tvshows.png`,
  'k-pop': `${CATEGORIES_BASE}category-kpop.png`,
  comics: `${CATEGORIES_BASE}category-comics.jfif`,
  manga: `${CATEGORIES_BASE}category-manga.png`,
  cosplay: `${CATEGORIES_BASE}category-cosplay.png`,
}

export const CATEGORY_HERO_PUBLIC_IMAGES = {
  anime: `${CATEGORIES_BASE}anime-pokemon-banner.jfif`,
  gaming: `${CATEGORIES_BASE}game-minecraft-banner.jfif`,
  movies: `${CATEGORIES_BASE}Taar-Zameen-Par-banner.jfif`,
  'tv-shows': `${CATEGORIES_BASE}tarak-mehta-banner.jfif`,
  'k-pop': `${CATEGORIES_BASE}bts-banner.jfif`,
  comics: `${CATEGORIES_BASE}The-Adventures-of-TinTin-banner.jfif`,
  manga: `${CATEGORIES_BASE}Yotsuba&!-banner.jfif`,
  cosplay: `${CATEGORIES_BASE}Modest-Minecraft-inspired-cosplay-banner.jfif`,
}

const bySlug = {
  pokemon: {
    imageUrl: `${CATEGORIES_BASE}pokemon-card-img.jfif`,
    imageUrls: [`${CATEGORIES_BASE}anime-pokemon-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}anime-pokemon-banner.jfif`, posterUrl: `${CATEGORIES_BASE}pokemon-card-img.jfif` },
  },
  doraemon: {
    imageUrl: `${CATEGORIES_BASE}doraemon-card-img.jfif`,
    imageUrls: [`${CATEGORIES_BASE}anime-doraemon-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}anime-doraemon-banner.jfif`, posterUrl: `${CATEGORIES_BASE}doraemon-card-img.jfif` },
  },
  minecraft: {
    imageUrl: `${CATEGORIES_BASE}game-minecraft-banner.jfif`,
    imageUrls: [`${CATEGORIES_BASE}game-minecraft-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}game-minecraft-banner.jfif`, posterUrl: `${CATEGORIES_BASE}game-minecraft-banner.jfif` },
  },
  'stardew-valley': {
    imageUrl: `${CATEGORIES_BASE}game-stardewvalley-banner.jfif`,
    imageUrls: [`${CATEGORIES_BASE}game-stardewvalley-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}game-stardewvalley-banner.jfif`, posterUrl: `${CATEGORIES_BASE}game-stardewvalley-banner.jfif` },
  },
  'winnie-the-pooh-2011': {
    imageUrl: `${CATEGORIES_BASE}winnie-the-pooh-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Winnie-the-Pooh-banner.jfif`],
    videoUrl: 'https://youtu.be/QbFz--GCkOM',
    details: {
      bannerUrl: `${CATEGORIES_BASE}Winnie-the-Pooh-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}winnie-the-pooh-card.jfif`,
      trailerUrl: 'https://youtu.be/QbFz--GCkOM',
      featuredMedia: { title: 'Winnie the Pooh Official Trailer', type: 'youtube', url: 'https://youtu.be/QbFz--GCkOM' },
    },
  },
  'little-forest-2018': {
    imageUrl: `${CATEGORIES_BASE}littleforest-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Little-Forest-family-banner.jfif`],
    videoUrl: 'https://youtu.be/3sVJPHbzabM',
    details: {
      bannerUrl: `${CATEGORIES_BASE}Little-Forest-family-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}littleforest-card.jfif`,
      trailerUrl: 'https://youtu.be/3sVJPHbzabM',
      featuredMedia: { title: 'Little Forest Official Trailer', type: 'youtube', url: 'https://youtu.be/3sVJPHbzabM' },
    },
  },
  'taare-zameen-par-2007': {
    imageUrl: `${CATEGORIES_BASE}taare-Zameen-par-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Taar-Zameen-Par-banner.jfif`],
    videoUrl: 'https://youtu.be/l5mP7W58AsI',
    details: {
      bannerUrl: `${CATEGORIES_BASE}Taar-Zameen-Par-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}taare-Zameen-par-card.jfif`,
      trailerUrl: 'https://youtu.be/l5mP7W58AsI',
      featuredMedia: { title: 'Taare Zameen Par Official Trailer', type: 'youtube', url: 'https://youtu.be/l5mP7W58AsI' },
    },
  },
  pororo: {
    imageUrl: `${CATEGORIES_BASE}Pororo-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}porroro-banner.jfif`],
    videoUrl: 'https://youtu.be/2DovicGnLGM',
    details: {
      bannerUrl: `${CATEGORIES_BASE}porroro-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}Pororo-card.jfif`,
      trailerUrl: 'https://youtu.be/2DovicGnLGM',
      featuredMedia: { title: 'Pororo Official Video', type: 'youtube', url: 'https://youtu.be/2DovicGnLGM' },
    },
  },
  'taarak-mehta-ka-ooltah-chashmah': {
    imageUrl: `${CATEGORIES_BASE}tarak-mehta-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}tarak-mehta-banner.jfif`],
    videoUrl: 'https://youtu.be/qrgbvsDsDS0',
    details: {
      bannerUrl: `${CATEGORIES_BASE}tarak-mehta-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}tarak-mehta-card.jfif`,
      trailerUrl: 'https://youtu.be/qrgbvsDsDS0',
      featuredMedia: { title: 'Taarak Mehta Official Video', type: 'youtube', url: 'https://youtu.be/qrgbvsDsDS0' },
    },
  },
  zanjeerain: {
    imageUrl: `${CATEGORIES_BASE}Zanjeerain-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}zanjeerain-banner.jfif`],
    videoUrl: 'https://youtu.be/Y2EtKH9WQNs',
    details: {
      bannerUrl: `${CATEGORIES_BASE}zanjeerain-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}Zanjeerain-card.jfif`,
      trailerUrl: 'https://youtu.be/Y2EtKH9WQNs',
      featuredMedia: { title: 'Zanjeerain Official Video', type: 'youtube', url: 'https://youtu.be/Y2EtKH9WQNs' },
    },
  },
  bts: {
    imageUrl: `${CATEGORIES_BASE}bts-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}bts-banner.jfif`],
    videoUrl: 'https://youtu.be/gdZLi9oWNZg?list=RDgdZLi9oWNZg',
    details: {
      bannerUrl: `${CATEGORIES_BASE}bts-banner.jfif`,
      posterUrl: `${CATEGORIES_BASE}bts-card.jfif`,
      officialMediaUrl: 'https://youtu.be/gdZLi9oWNZg?list=RDgdZLi9oWNZg',
      featuredSong: { title: 'BTS - Dynamite', youtubeUrl: 'https://youtu.be/gdZLi9oWNZg?list=RDgdZLi9oWNZg' },
    },
  },
  blackpink: {
    imageUrl: `${CATEGORIES_BASE}BLACKPIN-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}BLACKPINK.jfif`],
    videoUrl: 'https://youtu.be/2GJfWMYCWY0?list=RD2GJfWMYCWY0',
    details: {
      bannerUrl: `${CATEGORIES_BASE}BLACKPINK.jfif`,
      posterUrl: `${CATEGORIES_BASE}BLACKPIN-card.jfif`,
      officialMediaUrl: 'https://youtu.be/2GJfWMYCWY0?list=RD2GJfWMYCWY0',
      featuredSong: { title: 'BLACKPINK - How You Like That', youtubeUrl: 'https://youtu.be/2GJfWMYCWY0?list=RD2GJfWMYCWY0' },
    },
  },
  'the-adventures-of-tintin': {
    imageUrl: `${CATEGORIES_BASE}The-Adventures-of-TinTin-cards.jfif`,
    imageUrls: [`${CATEGORIES_BASE}The-Adventures-of-TinTin-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}The-Adventures-of-TinTin-banner.jfif`, posterUrl: `${CATEGORIES_BASE}The-Adventures-of-TinTin-cards.jfif` },
  },
  asterix: {
    imageUrl: `${CATEGORIES_BASE}Asterix-card-img.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Asterix-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}Asterix-banner.jfif`, posterUrl: `${CATEGORIES_BASE}Asterix-card-img.jfif` },
  },
  'yotsuba-and': {
    imageUrl: `${CATEGORIES_BASE}Yotsuba&!-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Yotsuba&!-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}Yotsuba&!-banner.jfif`, posterUrl: `${CATEGORIES_BASE}Yotsuba&!-card.jfif` },
  },
  'chis-sweet-home': {
    imageUrl: `${CATEGORIES_BASE}Chi's-Sweet-Home-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Chi's-Sweet-Home-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}Chi's-Sweet-Home-banner.jfif`, posterUrl: `${CATEGORIES_BASE}Chi's-Sweet-Home-card.jfif` },
  },
  'modest-minecraft-inspired': {
    imageUrl: `${CATEGORIES_BASE}Modest-Minecraft-inspired-cosplay-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Modest-Minecraft-inspired-cosplay-banner.jfif`],
    details: { bannerUrl: `${CATEGORIES_BASE}Modest-Minecraft-inspired-cosplay-banner.jfif`, posterUrl: `${CATEGORIES_BASE}Modest-Minecraft-inspired-cosplay-card.jfif` },
  },
  'modest-pokemon-inspired': {
    imageUrl: `${CATEGORIES_BASE}Modest-Pokémon-inspired-cosplay-card.jfif`,
    imageUrls: [`${CATEGORIES_BASE}Modest-Pokémon-inspired-cosplay-card.jfif`],
    videoUrl: '',
    details: { bannerUrl: `${CATEGORIES_BASE}Modest-Pokémon-inspired-cosplay-card.jfif`, posterUrl: `${CATEGORIES_BASE}Modest-Pokémon-inspired-cosplay-card.jfif`, trailerUrl: '', officialMediaUrl: '' },
  },
}

const contributorImages = {
  'aamir khan': 'Aamir-Khan.jfif',
  'ameer gilani': 'Ameer-Gilani.jfif',
  'bud luckey': 'Bud-Luckey.jfif',
  'craig ferguson': 'Craig-Ferguson.jfif',
  'danyal zafar': 'Danyal-Zafar.jfif',
  'darsheel safary': 'Darsheel-Safary.jfif',
  daya: 'daya.jfif',
  'don hall': 'Don-Hall.jfif',
  'hergé': 'Hergé.jfif',
  herge: 'Hergé.jfif',
  jennie: 'JENNIE.jfif',
  jethalal: 'Jethalal.jfif',
  'j-hope': 'JHope.jfif',
  jhope: 'JHope.jfif',
  'jim cummings': 'Jim-Cummings.jfif',
  'jin ki-joo': 'Jin-Ki-joo.jfif',
  jin: 'Jin.jfif',
  jisoo: 'JISOO.jfif',
  'jungkook': 'jk.jfif',
  jk: 'jk.jfif',
  'kim tae-ri': 'Kim-Tae-ri.jfif',
  'kiyohiko azuma': 'Kiyohiko-Azuma.jfif',
  'konami kanata': 'Konami-Kanata.jfif',
  lisa: 'lisa.jfif',
  'moon so-ri': 'Moon-So-ri.jfif',
  nobita: 'Nobita.jfif',
  'park jimin': 'Park JIMIN.jfif',
  jimin: 'Park JIMIN.jfif',
  rm: 'rm.jfif',
  rosé: 'ROSe.jfif',
  rose: 'ROSe.jfif',
  'ryu jun-yeol': 'Ryu-Jun-yeol.jfif',
  'sajal aly': 'SajalAly.jfif',
  'stephen j anderson': 'Stephen-J-Anderson.jfif',
  suga: 'SUGA.jfif',
  tipendra: 'Tipendra.jfif',
  'tisca chopra': 'Tisca-Chopra.jfif',
  'travis oates': 'Travis-Taylor.jfif',
  v: 'V.jfif',
  'vipin sharma': 'Vipin-Sharma.jfif',
  'yim soon-rye': 'Yim-Soon-rye.jfif',
}

export const CONTENT_ASSET_OVERRIDES = bySlug

export function normalizeAssetKey(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getContentAssetOverride(content) {
  const slug = normalizeAssetKey(content?.slug)
  if (bySlug[slug]) return bySlug[slug]

  const title = normalizeAssetKey(String(content?.title || '').replace(/\(\d{4}\)/g, ''))
  return bySlug[title] || null
}

function fillContributorImages(contributors = []) {
  return contributors.map((person) => {
    if (person?.imageUrl) return person
    const file = contributorImages[normalizeAssetKey(person?.name).replace(/-/g, ' ')] || contributorImages[String(person?.name || '').toLowerCase()]
    return file ? { ...person, imageUrl: `${CATEGORIES_BASE}${file}` } : person
  })
}

export function applyContentAssetOverrides(content) {
  const override = getContentAssetOverride(content)
  if (!override) return content

  const details = {
    ...(content.details || {}),
    ...(override.details || {}),
    featuredMedia: {
      ...(content.details?.featuredMedia || {}),
      ...(override.details?.featuredMedia || {}),
    },
    featuredSong: {
      ...(content.details?.featuredSong || {}),
      ...(override.details?.featuredSong || {}),
    },
  }

  return {
    ...content,
    ...override,
    details,
    contributors: fillContributorImages(content.contributors || []),
    imageUrl: override.imageUrl || content.imageUrl,
    imageUrls: Array.from(new Set([...(override.imageUrls || []), ...(content.imageUrls || [])].filter(Boolean))),
    videoUrl: override.videoUrl !== undefined ? override.videoUrl : content.videoUrl,
  }
}
