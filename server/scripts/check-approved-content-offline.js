
const fs = require('node:fs')
const path = require('node:path')
const Content = require('../models/Content')
const records = require('./approved-content-18.json')
const assetManifest = require('./approved-content-assets.json')

const expected = {
  anime: ['Pokémon', 'Doraemon'],
  gaming: ['Minecraft', 'Stardew Valley'],
  movies: ['Winnie the Pooh (2011)', 'Little Forest (2018)', 'Taare Zameen Par (2007)'],
  'tv-shows': ['Zanjeerain', 'Pororo', 'Taarak Mehta Ka Ooltah Chashmah'],
  'k-pop': ['BTS', 'BLACKPINK'],
  comics: ['The Adventures of Tintin', 'Asterix'],
  manga: ['Yotsuba&!', "Chi's Sweet Home"],
  cosplay: ['Modest Minecraft-inspired', 'Modest Pokémon-inspired'],
}

async function main() {
const errors = []
const slugs = new Set()
const assetsBySlug = new Map(assetManifest.records.map((entry) => [entry.slug, entry]))
const missingAssets = []

if (records.length !== 18 || assetManifest.records.length !== 18) errors.push('Expected exactly 18 records and 18 asset entries.')
if (assetsBySlug.size !== assetManifest.records.length) errors.push('Duplicate asset manifest slug.')

for (const [category, titles] of Object.entries(expected)) {
  const actual = records.filter((record) => record.categorySlug === category).map((record) => record.title)
  if (JSON.stringify(actual) !== JSON.stringify(titles)) errors.push(`Wrong titles or order for ${category}.`)
}

for (const record of records) {
  if (slugs.has(record.slug)) errors.push(`Duplicate slug: ${record.slug}`)
  slugs.add(record.slug)
  if (record.collectionKey !== 'phase2-initial' || record.status !== 'draft') errors.push(`Unsafe collection/status: ${record.slug}`)
  if (record.imageUrl || record.imageUrls?.length || record.contributors?.some((person) => person.imageUrl)) errors.push(`Unreviewed image attached: ${record.slug}`)
  if (!record.externalLinks?.length) errors.push(`Missing metadata source: ${record.slug}`)
  const validation = await new Content(record).validate().then(() => null, (error) => error)
  if (validation) errors.push(`${record.slug}: ${validation.message}`)

  const assets = assetsBySlug.get(record.slug)
  if (!assets) { errors.push(`Missing asset manifest: ${record.slug}`); continue }
  const expectedPeople = new Set((record.contributors || []).map((person) => person.name))
  for (const person of assets.people || []) {
    if (!expectedPeople.has(person.name)) errors.push(`Unknown contributor in manifest: ${record.slug}/${person.name}`)
  }
  for (const asset of [assets.primary, ...(assets.gallery || []), ...(assets.people || []).map((person) => person.path)]) {
    if (!asset?.startsWith('/images/approved/') || asset.includes('..')) { errors.push(`Invalid asset path: ${record.slug}`); continue }
    if (!fs.existsSync(path.resolve(__dirname, '../../client/public', asset.slice(1)))) missingAssets.push(asset)
  }
}

for (const record of records) {
  for (const slug of record.relatedSlugs || []) {
    if (slug === record.slug || !slugs.has(slug)) errors.push(`Invalid related slug: ${record.slug} -> ${slug}`)
  }
}

const result = {
  mode: 'offline-validation-only',
  databaseConnected: false,
  writesPerformed: false,
  proposedCount: records.length,
  counts: Object.fromEntries(Object.keys(expected).map((category) => [category, records.filter((record) => record.categorySlug === category).length])),
  validationErrors: errors,
  missingAssetCount: missingAssets.length,
  missingAssets,
  readyForPublication: errors.length === 0 && missingAssets.length === 0,
  insertionRequiresSeparateExplicitApproval: true,
}
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1
}

main().catch((error) => {
  console.error('Offline validation failed:', error.message)
  process.exitCode = 1
})
