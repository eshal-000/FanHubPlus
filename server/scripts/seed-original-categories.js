
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mongoose = require('mongoose')
const Category = require('../models/Category')

const WRITE_FLAGS = ['--execute', '--i-understand-this-writes-to-fanhubplus']
const SHOULD_EXECUTE = WRITE_FLAGS.every((flag) => process.argv.includes(flag))
const ASSET_ROOT = path.resolve(__dirname, '../../client/src/assets')

const ORIGINAL_CATEGORIES = [
  {
    color: '#FF006B',
    description: 'Japanese animation, series, movies & OVAs',
    gradient: 'from-pink-500 to-rose-600',
    heroImage: '/src/assets/anime.jpg',
    icon: '⛩️',
    image: '/src/assets/anime.jpg',
    name: 'Anime',
    shortDescription: 'Japanese animation, series, movies & OVAs',
    slug: 'anime',
    sortOrder: 1,
    sourceAssetPath: 'client/src/assets/anime.jpg',
    status: 'active',
    totalContent: 248,
  },
  {
    color: '#8B5CF6',
    description: 'Video games, esports, consoles & reviews',
    gradient: 'from-violet-500 to-purple-600',
    heroImage: '/src/assets/gaming.jpg',
    icon: '🎮',
    image: '/src/assets/gaming.jpg',
    name: 'Gaming',
    shortDescription: 'Video games, esports, consoles & reviews',
    slug: 'gaming',
    sortOrder: 2,
    sourceAssetPath: 'client/src/assets/gaming.jpg',
    status: 'active',
    totalContent: 186,
  },
  {
    color: '#F59E0B',
    description: 'Blockbusters, indie films & cinematic universes',
    gradient: 'from-amber-500 to-orange-600',
    heroImage: '/src/assets/movies.jpg',
    icon: '🎬',
    image: '/src/assets/movies.jpg',
    name: 'Movies',
    shortDescription: 'Blockbusters, indie films & cinematic universes',
    slug: 'movies',
    sortOrder: 3,
    sourceAssetPath: 'client/src/assets/movies.jpg',
    status: 'active',
    totalContent: 312,
  },
  {
    color: '#06B6D4',
    description: 'Series, web shows, dramas & binge-worthy content',
    gradient: 'from-cyan-500 to-blue-600',
    heroImage: '/src/assets/tv-shows.jpg',
    icon: '📺',
    image: '/src/assets/tv-shows.jpg',
    name: 'TV Shows',
    shortDescription: 'Series, web shows, dramas & binge-worthy content',
    slug: 'tv-shows',
    sortOrder: 4,
    sourceAssetPath: 'client/src/assets/tv-shows.jpg',
    status: 'active',
    totalContent: 224,
  },
  {
    color: '#EC4899',
    description: 'Korean pop, idols, comebacks & concerts',
    gradient: 'from-pink-400 to-fuchsia-600',
    heroImage: '/src/assets/K-Pop.jpg',
    icon: '🎤',
    image: '/src/assets/K-Pop.jpg',
    name: 'K-Pop',
    shortDescription: 'Korean pop, idols, comebacks & concerts',
    slug: 'k-pop',
    sortOrder: 5,
    sourceAssetPath: 'client/src/assets/K-Pop.jpg',
    status: 'active',
    totalContent: 158,
  },
  {
    color: '#10B981',
    description: 'Marvel, DC, indie comics & graphic novels',
    gradient: 'from-emerald-500 to-green-600',
    heroImage: '/src/assets/comics.jpg',
    icon: '🦸',
    image: '/src/assets/comics.jpg',
    name: 'Comics',
    shortDescription: 'Marvel, DC, indie comics & graphic novels',
    slug: 'comics',
    sortOrder: 6,
    sourceAssetPath: 'client/src/assets/comics.jpg',
    status: 'active',
    totalContent: 142,
  },
  {
    color: '#F472B6',
    description: 'Japanese manga, manhwa & light novels',
    gradient: 'from-rose-400 to-pink-600',
    heroImage: '/src/assets/manga.jpg',
    icon: '📖',
    image: '/src/assets/manga.jpg',
    name: 'Manga',
    shortDescription: 'Japanese manga, manhwa & light novels',
    slug: 'manga',
    sortOrder: 7,
    sourceAssetPath: 'client/src/assets/manga.jpg',
    status: 'active',
    totalContent: 198,
  },
  {
    color: '#A855F7',
    description: 'Costume design, conventions & cosplay artists',
    gradient: 'from-purple-500 to-indigo-600',
    heroImage: '/src/assets/cosplay.jpg',
    icon: '🎭',
    image: '/src/assets/cosplay.jpg',
    name: 'Cosplay',
    shortDescription: 'Costume design, conventions & cosplay artists',
    slug: 'cosplay',
    sortOrder: 8,
    sourceAssetPath: 'client/src/assets/cosplay.jpg',
    status: 'active',
    totalContent: 96,
  },
]

function duplicateValues(values) {
  const seen = new Set()
  const duplicates = new Set()

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }

  return [...duplicates]
}

function validateRecords() {
  const errors = []
  const assetChecks = ORIGINAL_CATEGORIES.map((category) => {
    const filename = path.basename(category.sourceAssetPath)
    const absolutePath = path.join(ASSET_ROOT, filename)
    const exists = fs.existsSync(absolutePath)

    if (!exists) {
      errors.push(`${category.name} image is missing at ${absolutePath}`)
    }

    return {
      exists,
      image: category.image,
      name: category.name,
      sourceAssetPath: category.sourceAssetPath,
    }
  })

  const requiredKeys = ['name', 'slug', 'image', 'sourceAssetPath', 'color', 'description', 'sortOrder']
  for (const category of ORIGINAL_CATEGORIES) {
    for (const key of requiredKeys) {
      if (category[key] === undefined || category[key] === '') {
        errors.push(`${category.name || category.slug || 'Unknown category'} is missing ${key}`)
      }
    }
  }

  for (const slug of duplicateValues(ORIGINAL_CATEGORIES.map((category) => category.slug))) {
    errors.push(`Duplicate proposed category slug: ${slug}`)
  }

  for (const name of duplicateValues(ORIGINAL_CATEGORIES.map((category) => category.name.toLowerCase()))) {
    errors.push(`Duplicate proposed category name: ${name}`)
  }

  for (const sortOrder of duplicateValues(ORIGINAL_CATEGORIES.map((category) => category.sortOrder))) {
    errors.push(`Duplicate proposed category sortOrder: ${sortOrder}`)
  }

  return { assetChecks, errors }
}

async function main() {
  const { assetChecks, errors } = validateRecords()

  if (errors.length) {
    console.error(JSON.stringify({ errors, writesPerformed: false }, null, 2))
    process.exit(1)
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    console.error(JSON.stringify({ error: 'MONGODB_URI is missing from server/.env', writesPerformed: false }, null, 2))
    process.exit(1)
  }

  await mongoose.connect(mongoUri, {
    autoCreate: false,
    autoIndex: false,
    dbName: process.env.MONGODB_DB_NAME || 'fanhubplus',
    serverSelectionTimeoutMS: 10000,
  })

  const slugs = ORIGINAL_CATEGORIES.map((category) => category.slug)
  const names = ORIGINAL_CATEGORIES.map((category) => category.name)
  const existing = await Category.find({
    $or: [{ slug: { $in: slugs } }, { name: { $in: names } }],
  }).lean()

  const existingBySlug = new Map(existing.map((category) => [category.slug, category]))
  const existingByName = new Map(existing.map((category) => [category.name, category]))

  const slugConflicts = existing
    .filter((category) => slugs.includes(category.slug))
    .map((category) => ({
      _id: category._id,
      existingImage: category.image,
      existingName: category.name,
      existingSlug: category.slug,
      existingStatus: category.status,
    }))

  const nameConflicts = existing
    .filter((category) => names.includes(category.name) && !slugs.includes(category.slug))
    .map((category) => ({
      _id: category._id,
      existingName: category.name,
      existingSlug: category.slug,
      existingStatus: category.status,
    }))

  const recordsToInsert = ORIGINAL_CATEGORIES.filter(
    (category) => !existingBySlug.has(category.slug) && !existingByName.has(category.name),
  )

  const report = {
    assetChecks,
    database: mongoose.connection.name,
    mode: SHOULD_EXECUTE ? 'execute' : 'dry-run',
    proposedRecordCount: ORIGINAL_CATEGORIES.length,
    proposedRecords: ORIGINAL_CATEGORIES,
    recordsToInsert,
    recordsToInsertCount: recordsToInsert.length,
    slugConflicts,
    skippedExistingCount: slugConflicts.length,
    unsafeNameConflicts: nameConflicts,
    writesPerformed: false,
  }

  if (!SHOULD_EXECUTE) {
    console.log(JSON.stringify(report, null, 2))
    await mongoose.connection.close()
    return
  }

  if (nameConflicts.length) {
    console.error(JSON.stringify({
      ...report,
      error: 'Refusing to insert because one or more category names already exist under different slugs.',
    }, null, 2))
    await mongoose.connection.close()
    process.exit(1)
  }

  if (!recordsToInsert.length) {
    console.log(JSON.stringify({
      ...report,
      message: 'All original category records already exist. No inserts needed.',
    }, null, 2))
    await mongoose.connection.close()
    return
  }

  const inserted = await Category.insertMany(recordsToInsert, {
    ordered: true,
    rawResult: false,
  })

  console.log(JSON.stringify({
    ...report,
    insertedIds: inserted.map((category) => category._id),
    insertedSlugs: inserted.map((category) => category.slug),
    rollbackFilter: { slug: { $in: inserted.map((category) => category.slug) } },
    writesPerformed: true,
  }, null, 2))

  await mongoose.connection.close()
}

main().catch(async (error) => {
  console.error(JSON.stringify({ error: error.message, writesPerformed: false }, null, 2))
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  process.exit(1)
})
