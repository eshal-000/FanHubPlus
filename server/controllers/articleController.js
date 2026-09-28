const Article = require('../models/Article')
const { categoryAliases, toCategorySlug } = require('../utils/category')
const { searchCondition } = require('../utils/search')

function normalizeArticle(article) {
  return {
    ...article,
    categorySlug: article.categorySlug || toCategorySlug(article.fandom || article.category),
    imageUrl: article.imageUrl || article.imageUrls?.[0] || '',
    status: article.status || 'published',
  }
}

function withArticleCanonicals(body) {
  const next = { ...body }
  const categorySlug = body.categorySlug || toCategorySlug(body.fandom || body.category)
  const imageUrl = body.imageUrl || body.imageUrls?.[0]
  if (categorySlug) next.categorySlug = categorySlug
  if (imageUrl) next.imageUrl = imageUrl
  return next
}

exports.getArticles = async (req, res, next) => {
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
    const searchQuery = searchCondition(search, ['title', 'excerpt', 'body', 'author', 'tags'])
    if (searchQuery) clauses.push(searchQuery)

    const query = clauses.length === 1 ? clauses[0] : { $and: clauses }

    let sortSpec = { views: -1, createdAt: -1 }
    if (sort === 'latest') sortSpec = { createdAt: -1 }
    if (sort === 'az') sortSpec = { title: 1 }

    const articles = (await Article.find(query).sort(sortSpec).lean()).map(normalizeArticle)
    res.json({ articles, count: articles.length })
  } catch (err) {
    next(err)
  }
}

exports.getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).lean()
    if (!article) return res.status(404).json({ message: 'Article not found' })
    return res.json({ article: normalizeArticle(article) })
  } catch (err) {
    next(err)
  }
}

exports.createArticle = async (req, res, next) => {
  try {
    const article = await Article.create(withArticleCanonicals(req.body))
    res.status(201).json({ message: 'Article created', article })
  } catch (err) {
    next(err)
  }
}

exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, withArticleCanonicals(req.body), {
      new: true,
      runValidators: true,
    })
    if (!article) return res.status(404).json({ message: 'Article not found' })
    return res.json({ message: 'Article updated', article })
  } catch (err) {
    next(err)
  }
}

exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id)
    if (!article) return res.status(404).json({ message: 'Article not found' })
    return res.json({ message: 'Article deleted' })
  } catch (err) {
    next(err)
  }
}
