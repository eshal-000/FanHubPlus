const Character = require('../models/Character')
const { categoryAliases, toCategorySlug } = require('../utils/category')
const { searchCondition } = require('../utils/search')

function normalizeCharacter(character) {
  return {
    ...character,
    abilities: character.abilities?.length ? character.abilities : character.traits || [],
    categorySlug: character.categorySlug || toCategorySlug(character.fandom || character.category),
    imageUrl: character.imageUrl || character.image || '',
    series: character.series || character.fandom || '',
    status: character.status || 'published',
    title: character.title || character.category || '',
  }
}

function withCharacterCanonicals(body) {
  const next = { ...body }
  const categorySlug = body.categorySlug || toCategorySlug(body.fandom || body.category)
  const imageUrl = body.imageUrl || body.image
  if (categorySlug) next.categorySlug = categorySlug
  if (imageUrl) next.imageUrl = imageUrl
  return next
}

exports.getCharacters = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query
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
    const searchQuery = searchCondition(search, ['name', 'series', 'bio', 'tags'])
    if (searchQuery) clauses.push(searchQuery)

    const query = clauses.length === 1 ? clauses[0] : { $and: clauses }

    let sortSpec = { likes: -1, rating: -1, createdAt: -1 }
    if (sort === 'latest') sortSpec = { createdAt: -1 }
    if (sort === 'az') sortSpec = { name: 1 }

    const characters = (await Character.find(query).sort(sortSpec).lean()).map(normalizeCharacter)
    res.json({ characters, count: characters.length })
  } catch (err) {
    next(err)
  }
}

exports.getCharacterById = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id).lean()
    if (!character) return res.status(404).json({ message: 'Character not found' })
    return res.json({ character: normalizeCharacter(character) })
  } catch (err) {
    next(err)
  }
}

exports.createCharacter = async (req, res, next) => {
  try {
    const character = await Character.create(withCharacterCanonicals(req.body))
    res.status(201).json({ message: 'Character created', character })
  } catch (err) {
    next(err)
  }
}

exports.updateCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndUpdate(req.params.id, withCharacterCanonicals(req.body), {
      new: true,
      runValidators: true,
    })
    if (!character) return res.status(404).json({ message: 'Character not found' })
    return res.json({ message: 'Character updated', character })
  } catch (err) {
    next(err)
  }
}

exports.deleteCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id)
    if (!character) return res.status(404).json({ message: 'Character not found' })
    return res.json({ message: 'Character deleted' })
  } catch (err) {
    next(err)
  }
}
